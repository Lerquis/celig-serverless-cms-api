import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import createError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { CreateBlogSchema } from "../../lib/schemas/blogSchemas.js";
import { notifyUsers } from "../../lib/notifyUsers.js";
import slugify from "slugify";
import { existingBlog } from "../../lib/existingBlog.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createBlog = async (event, context) => {
  const { title, tags, content } = event.body;

  const slug = slugify(title, { lower: true, strict: true });
  const existing = await existingBlog(slug);

  if (existing.Count > 0)
    throw new createError.Conflict("A blog with this title already exists");

  const blog = {
    id: uuid(),
    title,
    tags,
    content,
    slug,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await dynamoDB
      .put({ TableName: process.env.BLOG_TABLE_NAME, Item: blog })
      .promise();

    // ! Esto se tiene que descomentar, para seguir enviando correos cuando se crea un blog
    // await notifyUsers(blog);
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
