import AWS from "aws-sdk";
import { existingItem } from "../../lib/existingItem.js";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { UpdateBlogSchema } from "../../lib/schemas/blogSchemas.js";
import { transpileSchema } from "@middy/validator/transpile";
import createHttpError from "http-errors";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import slugify from "slugify";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const updateBlog = async (event) => {
  const { id } = event.pathParameters;
  const { title, tags, content } = event.body;

  let fieldsToUpdate = {};

  let newSlug;
  if (title) {
    newSlug = slugify(title, { lower: true, strict: true });
    const existing = await existingItem(
      newSlug,
      "slug",
      process.env.BLOG_TABLE_NAME,
      "slug-index"
    );

    if (existing.Count > 0)
      if (existing.Items[0].id !== id)
        throw new createHttpError.Conflict(
          "Another blog with this title already exists."
        );
    fieldsToUpdate.title = title;
    fieldsToUpdate.slug = newSlug;
  }

  if (tags) fieldsToUpdate.tags = tags;
  if (content) fieldsToUpdate.content = content;

  fieldsToUpdate.updatedAt = new Date().toISOString();

  const updateExpressions = [];
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  Object.entries(fieldsToUpdate).forEach(([key, value], index) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    updateExpressions.push(`${attrName} = ${attrValue}`);
    ExpressionAttributeNames[attrName] = key;
    ExpressionAttributeValues[attrValue] = value;
  });

  const UpdateExpression = "SET " + updateExpressions.join(", ");

  let updatedBlog;
  try {
    const result = await dynamoDB
      .update({
        TableName: process.env.BLOG_TABLE_NAME,
        Key: { id },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
      .promise();
    updatedBlog = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError("Could not update blog");
  }

  return { statusCode: 200, body: JSON.stringify({ updatedBlog }) };
};

export const handler = commonMiddleware(updateBlog, [
  httpJsonBodyParser(),
  validator({
    eventSchema: transpileSchema(UpdateBlogSchema),
  }),
]);
