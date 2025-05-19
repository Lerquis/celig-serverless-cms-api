import AWS from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getPodcasts = async (event) => {
  let result;
  try {
    result = await dynamoDB
      .scan({
        TableName: process.env.PODCAST_TABLE_NAME,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError("Could not fetch blogs");
  }

  const ordered = result.Items.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ podcasts: ordered }),
  };
};

export const handler = commonMiddleware(getPodcasts);
