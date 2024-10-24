const bwipjs = require('bwip-js');
const AWS = require('aws-sdk');

// Configure AWS SDK for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint('blr1.digitaloceanspaces.com');
 // Replace with your region's endpoint
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
  region: 'blr1', // Use your Space's region code if necessary
});


const generateBarcode = (userId, callback) => {
  const barcodeData = `https://yourdomain.com/user/getuser/${userId}`; // Data for the barcode

  // Generate the barcode as a PNG buffer
  bwipjs.toBuffer({
    bcid: 'code128',       // Barcode type
    text: barcodeData,     // Data to encode
    scale: 3,              // Scale factor
    height: 10,            // Barcode height in millimeters
    includetext: true,     // Include text below the barcode
    textxalign: 'center',  // Center the text
  }, (err, pngBuffer) => {
    if (err) {
      return callback(err);
    }

    // Define the filename for the barcode
    const barcodeFileName = `user_${userId}_barcode.png`;

    // Upload the barcode image to DigitalOcean Spaces
    const params = {
      Bucket: 'curtis-emp-data', // Replace with your DigitalOcean Space name
      Key: `barcodes/${barcodeFileName}`, // File path in the Space
      Body: pngBuffer, // The PNG buffer to upload
      ACL: 'public-read', // Make the file publicly accessible
      ContentType: 'image/png', // Set the file's content type
    };

    s3.upload(params, (err, data) => {
      if (err) {
        return callback(err); // Handle error during upload
      }

      // Return the public URL of the uploaded barcode
      callback(null, data.Location); // `data.Location` is the public URL of the barcode image
    });
  });
};

module.exports = generateBarcode;
