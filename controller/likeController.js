
const { posts, Like, sequelize, Sequelize } = require("../models");


async function onlike(req, res) {
  const { userId } = res.locals;
  const { postId } = req.params;
 
  const islike = await Like.findAll({
    where: { userId: userId, postId: postId },
  });
 
  if (islike[0] !== undefined) {
    res.status(400).send({ errorMessage: "이미 좋아요를 클릭하셨습니다." });
    return
  } 
    const dolike = await Like.create({
    
        userId:userId, postId:postId
      
    });
    
  const likes = await Like.findAll({ where: { postId:postId } });
  const likeNum = likes.length;

  res.status(200).send({ likeNum, message: "좋아요 완료" });
}

//좋아요 취소
async function unlike(req, res) {
  const { userId } = res.locals;
  const { postId } = req.params;

  // const islike = await Like.findAll({ where: { postId, userId } });
  // console.log("00000=", islike[0] !== undefined);
  // if (islike[0] == undefined) {
  //   res.status(400).send({ errorMessage: "좋아요를 아직 클릭하지 않았습니다." });
  //   return;
  // } 
    const dellike = await Like.destroy({
      where: {
        userId: userId,
        postId: postId
      },
    });
 console.log(dellike);
  const likes = await Like.findAll({ where: { postId:postId } });
  const likeNum = likes.length;

  res.status(200).send({ likeNum, msg: "좋아요 취소완료" });
}

module.exports.onlike = onlike;
module.exports.unlike = unlike;
