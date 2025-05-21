import AWS from "aws-sdk";
import { commonMiddleware } from "../../lib/commonMiddleware.js";
import { transpileSchema } from "@middy/validator/transpile";
import { UpdateTestimonialSchema } from "../../lib/schemas/testimonialSchemas.js";
import { deleteImageFromS3 } from "../../lib/deleteImageFromS3.js";
import { v4 as uuid } from "uuid";
import { uploadPicture } from "../../lib/uploadPicture.js";
import createHttpError from "http-errors";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import validator from "@middy/validator";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const updateTestimonial = async (event) => {
  const { id } = event.pathParameters;
  const { names, content, image } = event.body;

  let fieldsToUpdate = {};

  if (names) fieldsToUpdate.names = names;
  if (content) fieldsToUpdate.content = content;
  if (image) {
    const existingTestimonial = await dynamoDB
      .get({
        TableName: process.env.TESTIMONIAL_TABLE_NAME,
        Key: { id },
      })
      .promise();
    if (existingTestimonial.Item.imageName)
      await deleteImageFromS3(existingTestimonial.Item.imageName);
    if (image === "delete") {
      fieldsToUpdate.imageUrl = "";
      fieldsToUpdate.imageName = "";
    } else {
      fieldsToUpdate.imageName = `testimonials-${uuid()}`;
      fieldsToUpdate.imageUrl = await uploadPicture(
        image,
        fieldsToUpdate.imageName
      );
    }
  }
  fieldsToUpdate.updatedAt = new Date().toISOString();

  const updateExpressions = [];
  const ExpressionAttributeNames = {};
  const ExpressionAttributeValues = {};

  Object.entries(fieldsToUpdate).forEach(([key, value], index) => {
    const attrName = `#attr${index}`;
    const attrValue = `:val${index}`;
    updateExpressions.push(`${attrName} = ${attrValue}`);
    ExpressionAttributeNames[attrName] = key;
    ExpressionAttributeValues[attrValue] = value;
  });

  const UpdateExpression = "SET " + updateExpressions.join(", ");

  let updatedTestimonial;

  try {
    const result = await dynamoDB
      .update({
        TableName: process.env.TESTIMONIAL_TABLE_NAME,
        Key: { id },
        UpdateExpression,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
      .promise();
    updatedTestimonial = result.Attributes;
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError(
      "Could not update the testimonial"
    );
  }

  return { statusCode: 200, body: JSON.stringify({ updatedTestimonial }) };
};

export const handler = commonMiddleware(updateTestimonial, [
  httpJsonBodyParser(),
  validator({
    eventSchema: transpileSchema(UpdateTestimonialSchema),
  }),
]);
