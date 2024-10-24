const AWS = require('aws-sdk');

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint('blr1.digitaloceanspaces.com');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: 'blr1', // Use your Space's region code if necessary
});

const uploadDocument = (fileBuffer, fileName, callback) => {
  const params = {
    Bucket: 'curtis-emp-data', // Replace with your DigitalOcean Space name
    Key: `documents/${fileName}`, // File path in the Space
    Body: fileBuffer, // The document buffer to upload
    ACL: 'private', // Adjust based on your needs
    ContentType: 'application/pdf', // Adjust based on the document type
  };

  s3.upload(params, (err, data) => {
    if (err) {
      return callback(err); // Handle error during upload
    }
    callback(null, data.Location); // Return the public URL of the uploaded document
  });
};

module.exports = uploadDocument;
