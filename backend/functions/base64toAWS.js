const AWS = require('aws-sdk');
const crypto = require('crypto');
const fs = require('fs');

const s3 = new AWS.S3({
  accessKeyId:process.env.AWS_ACCESS_KEY,
  secretAccessKey:process.env.AWS_SECRET_KEY,
  region:process.env.AWS_BUCKET_REGION
});

function getContentTypeFromBase64(base64Image) {
  const base64Data = base64Image.split(';base64,')[0];
  const contentType = base64Data.split(':')[1];
  return contentType;
}

async function saveImageToAWS(base64Image) {
  // Extract image format and data from base64 string
  const matches = base64Image.match(/^data:image\/([a-z]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 image format');
  }

  const imageFormat = matches[1]; // Extracted image format (e.g., png, jpeg)
  const imageData = matches[2]; // Extracted image data (binary)

  // Decode base64 image data into binary
  const decodedImage = Buffer.from(imageData, 'base64');

  // Generate a unique filename or specify your own
  const filename = `${Date.now()}${crypto.randomBytes(16).toString('hex')}.${imageFormat}`;

  try {
    // Write the image data to a file
    fs.writeFileSync(filename, decodedImage, 'binary');

    // Upload the file to Amazon S3
    const s3Params = {
      Bucket: 'mood-s3-storage-photos',
      Key: filename,
      Body: decodedImage,
      ContentType: getContentTypeFromBase64(base64Image),
    };

    await s3.upload(s3Params).promise();

    // Delete the local file after uploading (optional)
    fs.unlinkSync(filename);

    // Return the public URL of the uploaded image
    const publicUrl = `https://mood-s3-storage-photos.s3.eu-central-1.amazonaws.com/${filename}`;
    return publicUrl;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to upload image to AWS');
  }
}

module.exports = saveImageToAWS