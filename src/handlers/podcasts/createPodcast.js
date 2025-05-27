import AWS from "aws-sdk";
import { v4 as uuid } from "uuid";
import { transpileSchema } from "@middy/validator/transpile";
import { PodcastSchema } from "../../lib/schemas/podcastSchemas.js";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { existingItem } from "../../lib/existingItem.js";
import { convertToSpotifyEmbedUrl } from "../../lib/convertEmbedSpotify.js";
import createHttpError from "http-errors";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createPodcast = async (event) => {
  const { url } = event.body;

  const newUrl = convertToSpotifyEmbedUrl(url);

  const existing = await existingItem(
    newUrl,
    "url",
    process.env.PODCAST_TABLE_NAME,
    "url-index"
  );

  if (existing.Count > 0)
    throw new createHttpError.Conflict("This blog already exists");

  const podcast = {
    id: uuid(),
    url: newUrl,
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
