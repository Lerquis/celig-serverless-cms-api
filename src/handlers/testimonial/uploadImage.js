import { uploadPictureToS3 } from "../lib/uploadPictureToS3.js";
import { v4 as uuid } from "uuid";
import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import createError from "http-errors";
import cors from "@middy/http-cors";
import { returnImageBuffer } from "../../lib/returnImageBuffer.js";

export async function uploadPicture(event) {
  const buffer = returnImageBuffer(event.body);

  const filename = uuid() + Date.now();

  let pictureUrl = "";
  try {
    pictureUrl = await uploadPictureToS3(filename + ".jpg", buffer);

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
