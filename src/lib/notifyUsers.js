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
          body: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nuevo Blog - CELIG</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f8f9fa;">
  <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ffb3ba 0%, #ffdfba 16.66%, #ffffba 33.33%, #baffc9 50%, #bae1ff 66.66%, #dbb3ff 83.33%, #ffb3ba 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: black; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: 2px;">CELIG</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #2d3748; margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">¡Nuevo blog disponible!</h2>
      
      <div style="background: #f7fafc; border-left: 4px solid #000000; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="color: black; margin: 0; font-size: 18px; font-weight: 300;">${title}</h3>
      </div>
      
      <p style="color: #4a5568; margin: 20px 0; font-size: 16px;">
        Hemos publicado un nuevo artículo que creemos que te interesará. No te lo pierdas.
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:4321/blogs/${title
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^\w\-]/g, "")}" 
           style="background: #000000; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block; transition: transform 0.2s;">
          Leer artículo
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f7fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="color: #718096; margin: 0; font-size: 14px;">
        © ${new Date().getFullYear()} CELIG. Todos los derechos reservados.
      </p>
    </div>
    
  </div>
</body>
</html>
          `,
        }),
      })
      .promise()
  );

  await Promise.all(messages);
}
