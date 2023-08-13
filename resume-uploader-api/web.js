const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { SFNClient, StartExecutionCommand } = require('@aws-sdk/client-sfn');
const { SQSClient, ReceiveMessageCommand, PurgeQueueCommand } = require('@aws-sdk/client-sqs');
const ApiBuilder = require('claudia-api-builder');

const api = new ApiBuilder();

const s3Client = new S3Client('us-east-1');
const sfnClient = new SFNClient('us-east-1');
const sqsClient = new SQSClient('us-east-1');

const s3BucketName = '<unique-bucket-name>';
const stateMachineArn = '<state-machine-arn>';
const queueUrl = '<sqs-queue-url>';

api.post('/', async function (request) {
  const storedFileName = request.queryString.fileName;
  const fileContents = request.body;

  const s3Command = new PutObjectCommand({
    Bucket: s3BucketName,
    Key: storedFileName,
    Body: fileContents
  });

  await s3Client.send(s3Command);

  const sfnCommand = new StartExecutionCommand({
    input: JSON.stringify({ storedFileName }),
    stateMachineArn
  });

  await sfnClient.send(sfnCommand);
}, {
  success: { code: 204 }
});

api.get('/', async function () {
  const command = new ReceiveMessageCommand({
    QueueUrl: queueUrl
  });

  const response = await sqsClient.send(command);

  response.Messages = response.Messages?.map(message =>
    JSON.parse(message.Body)
  ) || [];

  return response;
});

api.delete('/', async function () {
  const command = new PurgeQueueCommand({
    QueueUrl: queueUrl
  });

  await sqsClient.send(command);
}, {
  success: { code: 204 }
});

module.exports = api;
