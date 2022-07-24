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
// ==============================================================


// 이미지 넣기
async function PostImage(req, res) {
    const image = req.files;
    console.log(image);

    const postImageKEY = image.map(postImageKEY => postImageKEY.key);
    const postImageURL = image.map(postImageURL => postImageURL.location);

    const postImages = await images.create({ 
      postImageKEY: postImageKEY.toString(), 
      postImageURL: postImageURL.toString(),
    });

    res.status(200).send({ postImages, postImageKEY, postImageURL, msg: "성공" });
};


// 이미지 삭제
async function DeleteImages(req, res) {
  const { image } = req.body
  console.log(image);
  const fileName = JSON.stringify(image).slice(0, -1).split('images/')[1];
  console.log(`images/${fileName}`);

  // s3.getObject(
  //   {
  //     Bucket: process.env.AWS_BUCKET_NAME,
  //     Key: `images/${fileName}`,
  //   }),
  //   console.log("지나가나요?");

  // 이미지 1개 삭제할 때
  s3.deleteObject({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `images/${fileName}`
  }, function (err, data) {
    if (err) { throw err; }
    console.log('s3 deleteObject', data);
  });

  console.log("지나가나요?");
  res.send({ msg: "사진이 삭제되었습니다!" });
};



module.exports.PostImage = PostImage;
module.exports.DeleteImages = DeleteImages;