import AWS from "aws-sdk";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createHttpError from "http-errors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getImages = async () => {
  let result;
  try {
    result = await dynamoDB
      .scan({
        TableName: process.env.GALLERY_TABLE_NAME,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError("Could not fetch gallery");
  }

  const ordered = result.Items.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ images: ordered }),
  };
};

export const handler = commonMiddleware(getImages);
