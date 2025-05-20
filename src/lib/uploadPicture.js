import { uploadPictureToS3 } from "../lib/uploadPictureToS3.js";

export async function uploadPicture(body, imageName) {
  const cleanedBase64 = body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(cleanedBase64, "base64");

  let pictureUrl = "";
  try {
    pictureUrl = await uploadPictureToS3(imageName + ".jpg", buffer);
  } catch (error) {
    console.log(error);
    throw new createHttpError.InternalServerError(error);
  }

  return pictureUrl;
}
