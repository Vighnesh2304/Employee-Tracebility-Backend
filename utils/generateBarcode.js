const bwipjs = require('bwip-js');
const fs = require('fs');
const path = require('path');


const generateBarcode = (userId, callback) => {
  const barcodeData = `https://yourdomain.com/user/get/${userId}`;

  bwipjs.toBuffer({
    bcid: 'code128',       
    text: barcodeData,     
    scale: 3,              
    height: 10,           
    includetext: true,    
    textxalign: 'center',  
  }, (err, pngBuffer) => {
    if (err) {
      return callback(err);
    }

    const barcodeFilePath = path.join(__dirname, 'barcodes', `user_${userId}_barcode.png`);

    if (!fs.existsSync(path.join(__dirname, 'barcodes'))) {
      fs.mkdirSync(path.join(__dirname, 'barcodes'));
    }

    fs.writeFile(barcodeFilePath, pngBuffer, (err) => {
      if (err) {
        return callback(err);
      }

      callback(null, barcodeFilePath);
    });
  });
};

module.exports = generateBarcode;