import AWS from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getBlogsByTag = async (event) => {
  const { tag } = event.queryStringParameters || {};

  // * if tag === '' gives all tags

  let result;
  try {
    result = await dynamoDB
      .scan({
        TableName: process.env.BLOG_TABLE_NAME,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError("Could not fetch blogs");
  }

  // filter by tags
  const filtered = tag
    ? result.Items.filter((item) => item.tags?.includes(tag))
    : result.Items;

  // sort by date - most recent (by update date)
  filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return {
    statusCode: 200,
    body: JSON.stringify({ blogs: filtered }),
  };
};

export const handler = commonMiddleware(getBlogsByTag);
