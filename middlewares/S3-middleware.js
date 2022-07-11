const path = require("path");
const multerS3 = require("multer-s3");
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');

require("dotenv").config();

// AWS S3 사용하기 위한 config
AWS.config.update({
    region: process.env.AWS_BUCEKT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

const getUniqFileName = (originalname) => {
  const name = uuidv4();
  const ext = originalname.split('.').pop();
  return `${name}.${ext}`;
}

// multer를 사용하여 이미지를 업로드하는 미들웨어
const upload = multer({
  storage: multerS3({
    s3: new AWS.S3(),
    bucket: process.env.AWS_BUCKET_NAME,
    // acl: 'public-read',
    limits: { fileSize: 5 * 1024 * 1024 },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function(req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function(req, file, cb) {
      const fileName = getUniqFileName(file.originalname);
      
      file.newName = fileName;

      cb(null, `images/${Date.now()}_${fileName}`);
    },
  }),
});

module.exports = upload;