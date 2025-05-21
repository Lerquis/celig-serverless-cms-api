import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function notifyUsers(blog) {
  const users = await dynamoDB
    .scan({
      TableName: process.env.SUSCRIPTOR_TABLE_NAME,
    })
    .promise();

  if (users.Count === 0) return;

  const { title } = blog;
  const messages = users.Items.map((user) =>
    sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: "Nuevo blog - CELIG",
          recipient: user.email,
          body: `${title}`,
        }),
      })
      .promise()
  );

  await Promise.all(messages);
}
