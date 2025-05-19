import AWS from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const deletePodcast = async (event) => {
  const { id } = event.pathParameters;

  try {
    await dynamoDB
      .delete({
        TableName: process.env.PODCAST_TABLE_NAME,
        Key: { id },
        ConditionExpression: "attribute_exists(id)", // asegura que exista
      })
      .promise();
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      throw new createHttpError.NotFound(`Podcast with id "${id}" not found.`);
    }

    console.error(error);
    throw new createHttpError.InternalServerError("Could not delete podcast");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Podcast deleted successfully" }),
  };
};

export const handler = commonMiddleware(deletePodcast);
