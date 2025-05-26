import AWS from "aws-sdk";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { transpileSchema } from "@middy/validator/transpile";
import { v4 as uuid } from "uuid";
import { CreateTestimonialSchema } from "../../lib/schemas/testimonialSchemas.js";
import { uploadPicture } from "../../lib/uploadPicture.js";
import createHttpError from "http-errors";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const createTestimonial = async (event) => {
  const { names, content, image } = event.body;

  let imageUrl = "";
  let imageName = "";
  if (image) {
    imageName = `testimonials-${uuid()}`;
    imageUrl = await uploadPicture(image, imageName);
    if (!imageUrl) {
      imageName = "";
      imageUrl = "";
    }
  }

  const testimonial = {
    id: uuid(),
    names,
    content,
    imageUrl,
    imageName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await dynamoDB
      .put({
        TableName: process.env.TESTIMONIAL_TABLE_NAME,
        Item: testimonial,
      })
      .promise();
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError(
      "Could not create testimonial"
    );
  }
  return { statusCode: 201, body: JSON.stringify({ testimonial }) };
};

export const handler = commonMiddleware(createTestimonial, [
  httpJsonBodyParser(),
  validator({
    eventSchema: transpileSchema(CreateTestimonialSchema),
  }),
]);
