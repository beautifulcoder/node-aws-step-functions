const { TextractClient, DetectDocumentTextCommand } = require('@aws-sdk/client-textract');

const textractClient = new TextractClient({ region: 'us-east-1' });

const s3BucketName = 'resume-uploader-upload';

exports.handler = async (event, _context, callback) => {
  const command = new DetectDocumentTextCommand({
    Document: {
      S3Object: {
        Bucket: s3BucketName,
        Name: event.storedFileName
      }
    }
  });

  const detectResponse = await textractClient.send(command);

  event.githubProfileUrl = detectResponse
    .Blocks
    .find(b => b.BlockType === 'WORD' &&
      b.Text.includes('github.com'))
    ?.Text;

  callback(null, event);
};
