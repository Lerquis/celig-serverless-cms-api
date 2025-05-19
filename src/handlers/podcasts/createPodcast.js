import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import createHttpError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";
import { PodcastSchema } from "../../lib/schemas/podcastSchemas.js";
import { existingPodcast } from "../../lib/existingPodcast.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createPodcast = async (event) => {
  const { url } = event.body;

  const existing = await existingPodcast(url);

  if (existing.Count > 0)
    throw new createHttpError.Conflict("This blog already exists");

  const podcast = {
    id: uuid(),
    url,
    createdAt: new Date().toISOString(),
  };

  try {
    await dynamoDB
      .put({
        TableName: process.env.PODCAST_TABLE_NAME,
        Item: podcast,
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new createHttpError.InternalServerError("Could not create podcast");
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ podcast }),
  };
};

export const handler = commonMiddleware(createPodcast, [
  httpJsonBodyParser(),
  validator({
    eventSchema: transpileSchema(PodcastSchema),
  }),
]);
