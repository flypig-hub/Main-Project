// const path = require("path");
const multerS3 = require("multer-s3");
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');
 
require("dotenv").config();

AWS.config.update({
    region: process.env.AWS_BUCEKT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    signatureVersion: 'v4'
});

const S3 = new AWS.S3();
const isAllowedMimetype = (mime) => ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/x-ms-bmp', 'image/webp'].includes(mime.toString());
const fileFilter = (Request, file, callback) => {
    const fileMime = file.mimetype;
    if(isAllowedMimetype(fileMime)) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}
const getUniqFileName = (originalname) => {
    const name = uuidv4();
    const ext = originalname.split('.').pop();
    return `${name}.${ext}`;
}

const handleUploadMiddleware = multer({
    fileFilter,
    storage: multerS3({
        s3: S3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: function (req, file, cb) {
            const fileName = getUniqFileName(file.originalname);
            const s3_inner_directory = 'public_asset';
            const finalPath = `${s3_inner_directory}/${fileName}`;

            file.newName = fileName;

            cb(null, finalPath );
        }
    })
});

exports = module.exports = {
    handleUploadMiddleware
};