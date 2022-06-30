const AWS = require('aws=sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

require('dotenv').config();

AWS.config.update({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});

const s3 = new AWS.S3();

const imageUploader = multer({
    storage: multerS3({
        s3: s3,
        acl: 'public-read',
        bucket: process.env.AWS_BUCKET_NAME,
        limits: { fileSize: 5 * 1024 * 1024 }, // 용량 제한
        contentType: multerS3.AUTO_CONTENT_TYPE, // 자동으로 콘텐츠 타입 세팅
        metadata: function(req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            cb(null, `postImage/${Date.now()}_${file.originalname}`);
        },
    }),
});

module.exports = imageUploader;