import AWS from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getBlogById = async (event) => {
  const { id } = event.pathParameters;

  let blog;

  try {
    const result = await dynamoDB
      .get({
        TableName: process.env.BLOG_TABLE_NAME,
        Key: { id },
      })
      .promise();

    blog = result.Item;
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError("Could not fetch blog");
  }

  if (!blog) {
    throw new createHttpError.NotFound(`Blog with id "${id}" not found`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ blog }),
  };
};

export const handler = commonMiddleware(getBlogById);
