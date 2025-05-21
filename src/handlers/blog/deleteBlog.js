import AWS from "aws-sdk";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createHttpError from "http-errors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const deleteBlog = async (event) => {
  const { id } = event.pathParameters;

  try {
    await dynamoDB
      .delete({
        TableName: process.env.BLOG_TABLE_NAME,
        Key: { id },
        ConditionExpression: "attribute_exists(id)", // asegura que exista
      })
      .promise();
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      throw new createHttpError.NotFound(`Blog with id "${id}" not found.`);
    }

    console.error(error);
    throw new createHttpError.InternalServerError("Could not delete blog");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Blog deleted successfully" }),
  };
};

export const handler = commonMiddleware(deleteBlog);
