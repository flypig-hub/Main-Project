const { images, posts, sequelize, Sequelize } = require("../models");
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid');

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
  const { images } = req.body;
  console.log(images);

  const postImageKey = images.map((postImageKey) => postImageKey);
  console.log(postImageKey);

  postImageKey.forEach((element, i) => {
    const postImageKEY = postImageKey[i];
    console.log(postImageKEY);
    const s3 = new AWS.S3();
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: postImageKey.map(postImageKEY => ({ Key: postImageKEY })), 
      }
    };
    s3.deleteObjects(params, function(err, data) {
      if (err) console.log(err, err.stack); // error
      else { console.log("S3에서 삭제되었습니다"), data }; // deleted
    });
  });

  console.log("지나가나요?");
  res.send({ msg: "사진이 삭제되었습니다!" });
};

module.exports.PostImage = PostImage;
module.exports.DeleteImages = DeleteImages;
module.exports.PostImages = PostImages;


async function PostImages(image, postId) {
  // const { userId } = res.locals.userId;
  const postImageKey = image.map(postImageKEY => postImageKEY.key);
  const postImageUrl = image.map(postImageURL => postImageURL.location);
  const thumbnailKEY = postImageKey[0];
  const thumbnailURL = postImageUrl[0];

  postImageKey.forEach((element, i) => {
    const postImageKEY = postImageKey[i];
    const postImageURL = postImageUrl[i]

  const postImages = images.create({ 
      // userId: userId,
      postId: postId,
      thumbnailURL: thumbnailURL.toString(),
      thumbnailKEY: thumbnailKEY.toString(),
      postImageURL: postImageURL.toString(),
      postImageKEY: postImageKEY.toString(),
      // userImageURL: userImageURL
  });
})
};