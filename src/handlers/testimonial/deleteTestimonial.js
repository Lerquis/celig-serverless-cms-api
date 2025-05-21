import AWS from "aws-sdk";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createHttpError from "http-errors";
import { deleteImageFromS3 } from "../../lib/deleteImageFromS3.js";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const deleteTestimonial = async (event) => {
  const { id } = event.pathParameters;

  // delete image

  try {
    const testimonial = await dynamoDB
      .get({
        TableName: process.env.TESTIMONIAL_TABLE_NAME,
        Key: { id },
      })
      .promise();

    if (!testimonial.Item)
      throw new createHttpError.NotFound(
        `Testimonial with id "${id}" not found.`
      );

    if (testimonial.Item.imageName.length !== "")
      await deleteImageFromS3(testimonial.Item.imageName);

    await dynamoDB
      .delete({
        TableName: process.env.TESTIMONIAL_TABLE_NAME,
        Key: { id },
        ConditionExpression: "attribute_exists(id)", // asegura que exista
      })
      .promise();
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      throw new createHttpError.NotFound(
        `Testimonial with id "${id}" not found.`
      );
    }

    console.error(error);
    throw new createHttpError.InternalServerError(
      "Could not delete testimonial"
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Testimonial deleted successfully" }),
  };
};

export const handler = commonMiddleware(deleteTestimonial);
