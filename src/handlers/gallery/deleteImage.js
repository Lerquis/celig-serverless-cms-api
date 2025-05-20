import AWS from "aws-sdk";
import createHttpError from "http-errors";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { deleteImageFromS3 } from "../../lib/deleteImageFromS3.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const deleteImage = async (event) => {
  const { name } = event.pathParameters;

  const deleted = await deleteImageFromS3(name);

  if (!deleted) throw new createHttpError.NotFound("Image not found on S3");

  try {
    const result = await dynamoDB
      .query({
        TableName: process.env.GALLERY_TABLE_NAME,
        IndexName: "name-index",
        KeyConditionExpression: "#name = :name",
        ExpressionAttributeNames: { "#name": "name" },
        ExpressionAttributeValues: { ":name": name },
      })
      .promise();

    const item = result.Items[0];
    if (!item) throw new createHttpError.NotFound("Image not found on DB");

    await dynamoDB
      .delete({
        TableName: process.env.GALLERY_TABLE_NAME,
        Key: { id: item.id },
        ConditionExpression: "attribute_exists(id)", // asegura que exista
      })
      .promise();
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      throw new createHttpError.NotFound(
        `Image with name "${name}" not found.`
      );
    }

    console.log(error);
    throw new createHttpError.InternalServerError("Could not delete image");
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Image deleted successfully" }),
  };
};

export const handler = commonMiddleware(deleteImage);
