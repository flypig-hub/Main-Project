
const { Like, sequelize, Sequelize } = require("../models");


async function onlike(req, res) {
  const { userId } = res.locals.user;
  const { postId } = req.params;

  const dolike = await Like.create({ userId, postId });
console.log(dolike);
  if (!dolike) {
    res.status(400).send({ errorMessage: "이미 좋아요를 클릭하셨습니다." });
    return;
  }
  const likes = await Like.findAll({ postId });
  const likeNum = likes.length;

  res.status(200).send({ likeNum, message: "좋아요 완료" });
}

//좋아요 취소
async function unlike(req, res) {
  const { userId } = res.locals.user;
  const { postId } = req.params;
  
  const delmylike = await Like.destroy({ where: { postId, userId } });

  if (!delmylike) {
    res.status(400).send({ errorMessage: "좋아요가 취소 되지 않았습니다." });
    return;
  }
  const likes = await Like.findAll({ postId });
  const likeNum = likes.length;

  res.status(200).send({ likeNum, msg: "좋아요 취소완료" });
}

module.exports.onlike = onlike;
module.exports.unlike = unlike;
