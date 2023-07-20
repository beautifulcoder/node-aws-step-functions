const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const s3Client = new S3Client('us-east-1');

const s3BucketName = 'resume-uploader-upload';
const signedUrlExpireSeconds = 24 * 60 * 60;

exports.handler = async (event, _context, callback) => {
  const command = new GetObjectCommand({
    Bucket: s3BucketName,
    Key: event.storedFileName
  });

  event.storedFileUrl = await getSignedUrl(
    s3Client,
    command,
    { expiresIn: signedUrlExpireSeconds }
  );

  callback(null, event);
};
