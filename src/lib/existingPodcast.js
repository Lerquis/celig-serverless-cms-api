import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const existingPodcast = async (url) => {
  const existing = await dynamoDB
    .query({
      TableName: process.env.PODCAST_TABLE_NAME,
      IndexName: "url-index",
      KeyConditionExpression: "#url = :url",
      ExpressionAttributeNames: { "#url": "url" },
      ExpressionAttributeValues: { ":url": url },
    })
    .promise();

  return existing;
};
