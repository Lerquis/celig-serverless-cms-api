import AWS from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const deleteSuscriptor = async (event) => {
  const { id } = event.pathParameters;

  try {
    await dynamoDB
      .delete({
        TableName: process.env.SUSCRIPTOR_TABLE_NAME,
        Key: { id },
        ConditionExpression: "attribute_exists(id)",
      })
      .promise();
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      throw new createHttpError.NotFound(`Suscriptor with id ${id} not found`);
    }

    console.log(error);
    throw new createHttpError.InternalServerError(
      "Could not delete suscriptor"
    );
  }
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Suscriptor deleted successfully" }),
  };
};

export const handler = commonMiddleware(deleteSuscriptor);
