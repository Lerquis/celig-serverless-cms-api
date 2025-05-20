import AWS from "aws-sdk";
import createHttpError from "http-errors";

const s3 = new AWS.S3();

export const deleteImageFromS3 = async (key) => {
  const params = {
    Bucket: process.env.CMS_BUCKET_NAME,
    Key: key + ".jpg",
  };

  try {
    await s3.deleteObject(params).promise();
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
};
