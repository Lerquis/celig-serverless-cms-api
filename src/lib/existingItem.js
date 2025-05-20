import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const existingItem = async (value, itemName, tableName, indexName) => {
  const expressionAttributeNames = `#${itemName}`;
  const expressionAttributeValues = `:${itemName}`;

  const existing = await dynamoDB
    .query({
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: `#${itemName} = :${itemName}`,
      ExpressionAttributeNames: { [expressionAttributeNames]: itemName },
      ExpressionAttributeValues: { [expressionAttributeValues]: value },
    })
    .promise();

  return existing;
};
