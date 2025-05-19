import { uploadPictureToS3 } from "../lib/uploadPictureToS3.js";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
import cors from "@middy/http-cors";

export async function uploadPicture(event) {
  const { id } = event.pathParameters;

  //? Eliminamos texto de la imagen innecesario
  const cleanedBase64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  //? Convertimos la imagen a un buffer
  const buffer = Buffer.from(cleanedBase64, "base64");

  let pictureUrl = "";
  try {
    pictureUrl = await uploadPictureToS3(id + ".jpg", buffer);

    //? Editamos el objeto (si es necesario) y le agregamos la imagen
    // updatedAuction = await setAuctionPictureUrl(auction.id, pictureUrl);
  } catch (error) {
    console.log(error);
    throw new createError.InternalServerError(error);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ statusCode: 201, pictureUrl }),
  };
}

export const handler = middy(uploadPicture).use(httpErrorHandler()).use(cors());
