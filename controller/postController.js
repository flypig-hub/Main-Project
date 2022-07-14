const {
  posts,
  comment,
  like,
  users,
  images,
  sequelize,
  Sequelize,
} = require("../models");
const multiparty = require("multiparty");
const AWS = require("aws-sdk");

// Node.js, MySQL

// 게시글 작성(유저)
async function WritePosting(req, res) {
  // try {
  // const { userId } = res.locals.userId;
  // const { nickname } = res.locals.nickname;
  // const { userImage } = res.locals.userImage;
  console.log(res.locals);
  const { userId, nickname, userImage } = res.locals;

  const {
    title,
    content,
    mainAddress,
    subAddress,
    category,
    type,
    link,
    houseTitle,
    imageKEY,
  } = req.body;

  const image = req.files;
  // console.log(req.files);

  const postImageKEY = image.map((postImageKEY) => postImageKEY.key);
  const postImageURL = image.map((postImageURL) => postImageURL.location);

  const thumbnailKEY = postImageKEY[0];
  const thumbnailURL = postImageURL[0];

  const postInfo = await posts.create({
    userId,
    userImage,
    nickname,
    title,
    content,
    mainAddress,
    subAddress,
    category,
    type,
    link,
      houseTitle,
      commentNum: 0,
      likeNum: 0,
    isLike:0,
    thumbnailURL: thumbnailURL.toString(),
    thumbnailKEY: thumbnailKEY.toString(),
    postImageURL: postImageURL.toString(),
    postImageKEY: postImageKEY.toString(),
  });

  res.status(201).send({ postInfo, postImageKEY, postImageURL });
  // } catch(e) {
  //     res.status(402).json({ errorMessage : "게시글이 등록되지 않았습니다."});
  // }
}

// 게시글 전체 조회
async function GetPostingList(req, res) {
  let allPost = await posts.findAll();

  for (i = 0; i < allPost.length; i++) {
    let post = allPost[i];
    console.log(post);
    const postComments = await comment.findAll({where: { postId: post.postId },});
    const postLikes = await like.findAll({ where: { postId: post.postId } });
      let islike = await like.findOne({ where: { userId: post.userId, postId: post.postId } });
    const likeNum = postLikes.length;
      const commentNum = postComments.length;
      islike = islike.length;
    Object.assign(post, { likeNum: likeNum, commentNum: commentNum, islike:islike });
    // return
  }
  console.log(allPost);

  res.send({ allPost });
}

// 게시글 상세 조회(S3 기능 추가 예정)
async function GetPost(req, res) {
  const { nickname, userId } = res.locals;
  const { postId } = req.params;

  const post = await posts.findAll({
    where: { postId },
    // order : [[ "createdAt", "DESC" ]]
  });
    const postComments = await comment.findAll({
      where: { postId: post.postId },
    });
      let islike = await like.findOne({
        where: { userId: post.userId, postId: post.postId },
      });
    const postLikes = await like.findAll({ where: { postId: post.postId } });
    const likeNum = postLikes.length;
      const commentNum = postComments.length;
      islike = islike.length;
    Object.assign(post, { likeNum: likeNum, commentNum: commentNum, islike:islike });
    // return
  
  console.log(post);

  // const comments = await Comment.findOne({ where: { postId },
  //     order : [[ "createdAt", "DESC" ]]
  // });

  // const postImage = await images.findOne({ where : { postId, postImageKEY, postImageURL },
  //     order : [[ "createdAt", "DESC" ]]
  // });
  // console.log(postImage);

  // const commentInfo = comments.map((comment) => ({
  //     commentId : comment.commentId,
  //     comment: comment.comment,
  //     commentWriter: commentWriterInfoById[comment.nickname],
  // }));

  res.send({
    nickname,
    userId,
    post,
    // commentInfo: commentInfo
  });
}

// 게시글 수정 (S3 기능 추가 예정)
async function ModifyPosting(req, res) {
  // try {
  const { userId, userImage, nickname } = res.locals;
  // console.log(res.locals);
  const { postId } = req.params;
  const {
    title,
    content,
    mainAddress,
    subAddress,
    category,
    type,
    link,
    houseTitle,
    imageKEY,
  } = req.body;
  // console.log(req.body);
  const image = req.files;
  console.log(image);

  const existPost = await posts.findOne({
    where: { postId },
  });

  if (userId !== existPost.userId) {
    await res.status(400).send({ errorMessage: "접근 권한이 없습니다!" });
  }

  const postImageKEY = image.map((postImageKEY) => postImageKEY.key);
  const postImageURL = image.map((postImageURL) => postImageURL.location);
  const thumbnailKEY = postImageKEY[0];
  const thumbnailURL = postImageURL[0];

  if (image.length === 0) {
    await posts.findOne({ where: { thumbnailURL } });
    res.send({ thumbnailURL });
  }

  // const imageURL = existPost.postImageURL.map(imageURL => imageURL.split('com/')[1]);
  // const s3 = new AWS.S3();
  // const params = {
  //     Bucket: process.env.AWS_BUCKET_NAME,
  //     Delete: {
  //         Objects: image.map((imageKey) => ({ Key: imageKey }))
  //     }
  // };
  // console.log(params);
  // s3.deleteObjects(params, function(err, data) {
  //     if (err) console.log(err, err.stack);
  //     else { console.log("삭제되었습니다.") }
  // })

  // if (nickname !== existPost.nickname) {
  //     await res.status(400).send({ errorMessage: "접근 권한이 없습니다!"});
  // };

  const ModifyPost = await existPost.update({
    userId,
    userImage,
    nickname,
    title,
    content,
    mainAddress,
    subAddress,
    category,
    type,
    link,
    houseTitle,
    thumbnailURL,
    thumbnailKEY,
    postImageURL: postImageURL.toString(),
    postImageKEY: postImageKEY.toString(),
  });

  res.status(200).send({ ModifyPost, msg: "게시글이 수정되었습니다!" });
  // } catch (e) {
  //     res.status(400).send({ errorMessage: "게시글을 수정을 할 수 없습니다." });
  // }
}

// 게시글 삭제 (S3 이미지 삭제 기능 추가 예정)
async function DeletePost(req, res) {
  // try {

  const { userId, nickname, userImage } = res.locals;
  const { postId } = req.params;

  const existPost = await posts.findOne({ where: { postId } });
  // console.log(existPost);
  // const s3 = new AWS.S3();
  // const params = {
  //     Bucket: process.env.AWS_BUCKET_NAME,
  //     Delete: { Objects: postImageKEY.map(postImageKEY => ({ Key: postImageKEY })) }
  // };
  // console.log(params);
  // s3.deleteObjects(params, function(err, data) {
  //     if (err) console.log(err, err.stack);
  //     else { console.log("삭제되었습니다.") }
  // })
  // 댓글, 게시글 삭제
  // if (userId !== existPost.userId) {
  //     res.send({msg: "삭제할 수 없습니다."})
  // };
  // if (nickname !== existPost.nickname) {
  //     res.send({msg: "삭제할 수 없습니다."})
  // };
  const dastroyPost = await posts.destroy({ where: { postId } });
  console.log(dastroyPost);
  // await Comment.destroy({
  //     where: { postId }
  // });
  res.status(200).send({ msg: "게시글이 삭제되었습니다!" });
  // } catch (e) {
  //     res.status(400).send({ errorMessage: "접근 권한이 없습니다!"});
  // }
}
module.exports.WritePosting = WritePosting;
module.exports.GetPostingList = GetPostingList;
module.exports.GetPost = GetPost;
module.exports.ModifyPosting = ModifyPosting;
module.exports.DeletePost = DeletePost;
