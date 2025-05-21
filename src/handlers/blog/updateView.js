import AWS from "aws-sdk";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createHttpError from "http-errors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const incrementBlogViews = async (event) => {
  const { id } = event.pathParameters;

  try {
    const blog = await dynamoDB
      .get({
        TableName: process.env.BLOG_TABLE_NAME,
        Key: { id },
      })
      .promise();

    if (!blog.Item) {
      throw new createHttpError.NotFound(`Blog with id "${id}" not found.`);
    }

    const result = await dynamoDB
      .update({
        TableName: process.env.BLOG_TABLE_NAME,
        Key: { id },
        UpdateExpression: "SET #views = if_not_exists(#views, :start) + :inc",
        ExpressionAttributeNames: {
          "#views": "views",
        },
        ExpressionAttributeValues: {
          ":inc": 1,
          ":start": 0,
        },
        ReturnValues: "ALL_NEW",
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ updatedBlog: result.Attributes }),
    };
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError("Could not increment views");
  }
};

export const handler = commonMiddleware(incrementBlogViews);
