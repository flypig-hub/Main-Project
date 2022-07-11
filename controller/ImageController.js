const ImageUploader = require("../middlewares/S3-middleware");
const { images, sequelize, Sequelize } = require("../models");
const path = require("path");
const { array } = require("../middlewares/S3-middleware");


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
    const { key } = req.query;
    // console.log(key);

    // if(!key 
    //     || !Array.isArray(key) 
    //     || (key && key.length == 0)
    // ) {
    //   res.status(400);
    //   return res.json({ error: 'Error! File keys not found.' })
    // }

    const fileStream = ImageUploader.getObject(key).createReadStream();
    console.log(fileStream);
    fileStream.pipe(res);
    console.log(fileStream.pipe(res));
    // res.status(200).send({ msg: "삭제되었습니다!" })
}


async function DeleteImages(req, res) {
    const { key } = req.params;

    const s3 = new AWS.S3();
        const deleteparams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Delete: { Objects: key.map(key => ({ Key: key })) }
        };
        console.log(deleteparams);

        s3.deleteObjects(deleteparams, function(err, data) {
            if (err) console.log(err, err.stack);
            else { console.log("삭제되었습니다.") }
        })
}

module.exports.PostImage = PostImage;
module.exports.GetImages = GetImages;