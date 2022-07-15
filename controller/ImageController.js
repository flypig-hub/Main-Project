const { images, posts, sequelize, Sequelize } = require("../models");
const path = require("path");
const multerS3 = require("multer-s3");
const multer = require("multer");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');
const upload = require("../middlewares/S3-middleware")

require("dotenv").config();

// ===========================================================
// S3 기본 세팅
const s3 = new AWS.S3({
    region: process.env.AWS_BUCEKT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
});

// AWS.config.update({
//     region: process.env.AWS_BUCEKT_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_KEY,
// });

// const getUniqFileName = (originalname) => {
//   const name = uuidv4();
//   const ext = originalname.split('.').pop();
//   return `${name}.${ext}`;
// }

// // multer를 사용하여 이미지를 업로드하는 미들웨어
// const upload = multer({
//   storage: multerS3({
//     s3: new AWS.S3(),
//     bucket: process.env.AWS_BUCKET_NAME,
//     // acl: 'public-read',
//     limits: { fileSize: 5 * 1024 * 1024 },
//     contentType: multerS3.AUTO_CONTENT_TYPE,
//     metadata: function(req, file, cb) {
//         cb(null, { fieldName: file.fieldname });
//     },
//     key: function(req, file, cb) {
//       const fileName = getUniqFileName(file.originalname);
      
//       file.newName = fileName;

//       cb(null, `images/${fileName}`);
//     },
//   }),
// });

// module.exports = upload;

// ==============================================================


// 이미지 넣기
async function PostImage(req, res) {
    const image = req.files;

    const postImageKEY = image.map(postImageKEY => postImageKEY.key);
    const postImageURL = image.map(postImageURL => postImageURL.location);
    // console.log(postImageKEY, postImageURL);

    const postImages = await images.create({ 
        postImageKEY: postImageKEY.toString(), 
        postImageURL: postImageURL.toString()
    });

    // console.log(postImages);
    res.status(200).send({ postImages, postImageKEY, postImageURL, msg: "성공" });
};


// 이미지 불러오기
async function GetImages(req, res) {
    const key = req.params;
    console.log(req.params);
    // const fileName = JSON.stringify(key).slice(0, -2).split('images/')[1];
    res.send({});
}

// // Key값을 배열로 만드는 함수
// const ImageKeyFunction = (Key) => {
//     const ImageKey = Key.map((data) => {
//         if (data.imageKey.length !== 0) {
//             data.imageKey = [];
//             return data;
//         }
//         let imageKey = data.imageKey;
//         for (let i = 0; i < imageKey.length; i++) {
//             imageKey[i] = `images/${fileName}${imageKey[i]}`
//         }
//         data.imageKey = imageKey;
//         return data;
//     });
//     return ImageKeyFunction;
// }


// 이미지 삭제
async function DeleteImages(req, res) {
    // const image = req.body;
    const { image } = req.params
    // console.log(image);
    const fileName = JSON.stringify(image).slice(0, -2).split('images/')[1];
    console.log(fileName);

    s3.getObject(
      {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `images/${fileName}`,
      }),
      console.log("지나가나요?");

    // 이미지 1개 삭제할 때
    s3.deleteObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${fileName}`
    }, function (err, data) {
      if (err) { throw err; }
      console.log('s3 deleteObject', data);
    });
      
    // 이미지 여러개 삭제할 때
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: [
          { Key: `images/${fileName}`}
        ],
        Quiet: false
      }
    };
    // const s3 = new AWS.S3();
    s3.deleteObjects(params, (err, data) => {
        if (err) return reject(err);
        return resolve(true);
      });
  res.send({ msg: "사진이 삭제되었습니다!" });
};


// const DeleteImages = function(s3, key) {
//     // const body = {
//     //     Key: 'images/11d128ca-085b-422f-bd37-d9ef8564e5eb.png' 
//     // }
//     // const s3 = new AWS.S3();
//     const params = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Key: key
//     };
//     // const s3 = new AWS.S3();
//     s3.deleteObject(params, (err, data) => {
//         if (err) return reject(err);
//         return resolve(true);
//       });

//     // s3.deleteObject({
//     // }, (err, data) => {
//     //     if (err) console.log(err, err.stack);
//     //     else { console.log("삭제되었습니다.") }
//     // })

//     res.send({ msg: "사진이 삭제되었습니다!" });
// }

module.exports.PostImage = PostImage;
module.exports.GetImages = GetImages;
module.exports.DeleteImages = DeleteImages;

// module.exports = {
//   PostImage,
//   GetImages,
//   DeleteImages
// }