import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const existingBlog = async (slug) => {
  const existing = await dynamoDB
    .query({
      TableName: process.env.BLOG_TABLE_NAME,
      IndexName: "slug-index",
      KeyConditionExpression: "#slug = :slug",
      ExpressionAttributeNames: { "#slug": "slug" },
      ExpressionAttributeValues: { ":slug": slug },
    })
    .promise();

  return existing;
};
