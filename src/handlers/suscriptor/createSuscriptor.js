import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import { transpileSchema } from "@middy/validator/transpile";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { CreateSuscriptorSchema } from "../../lib/schemas/suscriptorSchemas.js";
import { existingItem } from "../../lib/existingItem.js";
import createHttpError from "http-errors";
import httpJsonBodyParse from "@middy/http-json-body-parser";
import validator from "@middy/validator";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createSuscriptor = async (event) => {
  const { email } = event.body;

  const existing = await existingItem(
    email,
    "email",
    process.env.SUSCRIPTOR_TABLE_NAME,
    "email-index"
  );
  if (existing.Count > 0)
    throw new createHttpError.Conflict("A user with this email already exists");

  const suscriptor = {
    id: uuid(),
    email,
    createdAt: new Date().toISOString(),
  };

  try {
    await dynamoDB
      .put({
        TableName: process.env.SUSCRIPTOR_TABLE_NAME,
        Item: suscriptor,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError(
      "Could not create Suscriptor"
    );
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ suscriptor }),
  };
};

export const handler = commonMiddleware(createSuscriptor, [
  httpJsonBodyParse(),
  validator({ eventSchema: transpileSchema(CreateSuscriptorSchema) }),
]);
