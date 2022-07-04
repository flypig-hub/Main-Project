const ImageUploader = require("../middlewares/S3-middleware");
const { images, sequelize, Sequelize } = require("../models");
const path = require("path");

//이미지 넣기
async function PostImage(req, res) {
    const image = req.files;

    const postImageKEY = image.map(postImageKEY => postImageKEY.key);
    const postImageURL = image.map(postImageURL => postImageURL.location);
    console.log(postImageKEY, postImageURL);

    const postImages = await images.create({ 
        postImageKEY: postImageKEY.toString(), 
        postImageURL: postImageURL.toString()
    });

    console.log(postImages);
    res.status(200).send({ postImageKEY, postImageURL, msg: "성공" });
};

//이미지 불러오기
async function GetImages(req, res) {
    const { key } = req.params;
    const fileStream = ImageUploader.getObject(key).createReadStream();
    fileStream.pipe(res);
}

module.exports.PostImage = PostImage;
module.exports.GetImages = GetImages;