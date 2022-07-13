const ImageUploader = require("../middlewares/S3-middleware");
const { images, sequelize, Sequelize } = require("../models");
const path = require("path");
// const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
// const client = new S3Client({ region: "REGION" });
// const AWS = require('aws-sdk');
const upload = require("../middlewares/S3-middleware");


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
// async function DeleteImages(req, res) {
//     // const Key = req.body;

//     const ImageKeyFunction = () => {
//         const Key = Key.map((data) => {
//             if (data.Key.length !== 0) {
//                 data.Key = [];
//                 return data;
//             }
//             let Key = data.Key;
//             for (let i = 0; i < Key.length; i++) {
//                 Key[i] = `images/${fileName}${Key[i]}`
//             }
//             data.Key = Key;
//             return Key[i];
//         });
//         return Key[i];
//     }

//     const s3 = new AWS.S3();

//     s3.deleteObject({
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: ImageKeyFunction.Key[i],
//     }, (err, data) => {
//         if (err) console.log(err, err.stack);
//         else { console.log("삭제되었습니다.") }
//     })

//     res.send({ msg: "사진이 삭제되었습니다!" });
//     // if (params.Key !== 0)
//     // for (let i = 0; params.Key.length > i; i++) {
//     //     const Key = params.Key[i];
//     //     return Key
//     // }
// }

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
// module.exports.DeleteImages = DeleteImages;