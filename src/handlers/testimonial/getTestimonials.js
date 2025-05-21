import AWS from "aws-sdk";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import createHttpError from "http-errors";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const getTestimonials = async () => {
  let result;
  try {
    result = await dynamoDB
      .scan({
        TableName: process.env.TESTIMONIAL_TABLE_NAME,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError(
      "Could not fetch testimonials"
    );
  }

  const ordered = result.Items.sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ testimonials: ordered }),
  };
};

export const handler = commonMiddleware(getTestimonials);
