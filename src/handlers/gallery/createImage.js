import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import { uploadPicture } from "../../lib/uploadPicture.js";
import createHttpError from "http-errors";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import cors from "@middy/http-cors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createImage = async (event) => {
  const name = `gallery-${uuid()}`;

  const url = await uploadPicture(event.body, name);

  const image = {
    id: uuid(),
    name,
    url,
    createdAt: new Date().toISOString(),
  };

  try {
    await dynamoDB
      .put({
        TableName: process.env.GALLERY_TABLE_NAME,
        Item: image,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError("Could not create the image");
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Image saved successfully" }),
  };
};

export const handler = middy(createImage).use(httpErrorHandler()).use(cors());
