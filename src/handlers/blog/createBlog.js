import AWS from "aws-sdk";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { transpileSchema } from "@middy/validator/transpile";
import { CreateBlogSchema } from "../../lib/schemas/blogSchemas.js";
import { notifyUsers } from "../../lib/notifyUsers.js";
import { existingItem } from "../../lib/existingItem.js";
import { v4 as uuid } from "uuid";
import createError from "http-errors";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import slugify from "slugify";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createBlog = async (event, context) => {
  const { title, tags, content } = event.body;

  const slug = slugify(title, { lower: true, strict: true });
  const existing = await existingItem(
    slug,
    "slug",
    process.env.BLOG_TABLE_NAME,
    "slug-index"
  );

  if (existing.Count > 0)
    throw new createError.Conflict("A blog with this title already exists");

  const blog = {
    id: uuid(),
    title,
    tags,
    content,
    slug,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await dynamoDB
      .put({ TableName: process.env.BLOG_TABLE_NAME, Item: blog })
      .promise();

    // ! Esto se tiene que descomentar, para seguir enviando correos cuando se crea un blog
    await notifyUsers(blog);
  } catch (error) {
    console.error(error);
    throw new createError.InternalServerError("Could not create blog");
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ blog }),
  };
};

export const handler = commonMiddleware(createBlog, [
  httpJsonBodyParser(),
  validator({
    eventSchema: transpileSchema(CreateBlogSchema),
  }),
]);
