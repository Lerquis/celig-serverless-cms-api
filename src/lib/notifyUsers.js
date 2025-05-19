import AWS from "aws-sdk";

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sqs = new AWS.SQS();

export async function notifyUsers(blog) {
  // ! Sacamos todos los usuarios
  //   const params = {
  //     TableName: process.env.CMS_TABLE_NAME,
  //   };
  //   const users = await dynamoDB.get(params).promise();

  const users = [{ email: "estebanrojasquesada@gmail.com" }];

  const { title } = blog;
  const messages = users.map((user) =>
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
