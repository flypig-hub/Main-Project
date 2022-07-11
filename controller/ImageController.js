const ImageUploader = require("../middlewares/S3-middleware");
const { images, sequelize, Sequelize } = require("../models");
const path = require("path");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const client = new S3Client({ region: "REGION" });
const AWS = require('aws-sdk');


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
    res.status(200).send({ postImageKEY, postImageURL, msg: "성공" });
};


// 이미지 불러오기
async function GetImages(req, res) {
    const key = req.params;
    console.log(key);
    const data = await client.send(new GetObjectCommand(key));
    // return data; // For unit tests.

    const bodyContents = await streamToString(data.Body);
    console.log(bodyContents);
    return bodyContents;
}
    
// 이미지 삭제
async function DeleteImages(req, res) {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'images/1657528290668_16206e53-7ea4-4869-b026-3e514c3567d5.PNG' // 버킷에서 가져올 객체 이름
    }
    console.log(params);

    const s3 = new AWS.S3();

    s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: params.Key,
    }, (err, data) => {
        if (err) console.log(err, err.stack);
        else { console.log("삭제되었습니다.") }
    })
}

module.exports.PostImage = PostImage;
module.exports.GetImages = GetImages;
module.exports.DeleteImages = DeleteImages;