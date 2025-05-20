import AWS from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getSuscriptors = async () => {
  let result;
  try {
    result = await dynamoDB
      .scan({
        TableName: process.env.SUSCRIPTOR_TABLE_NAME,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError(
      "Could not fetch suscriptors"
    );
  }

  const ordered = result.Items.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ suscriptors: ordered }),
  };
};

export const handler = commonMiddleware(getSuscriptors);
