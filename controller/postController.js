const {
  posts,
  Comments,
  Like,
  users,
  images,
  sequelize,
  Sequelize,
} = require("../models");
const multiparty = require("multiparty");
const AWS = require("aws-sdk");

// 게시글 작성(유저)
async function WritePosting(req, res) {
  try {
  const { userId, nickname, userImageURL } = res.locals;
  const {
    title,
    content,
    mainAddress,
    subAddress,
    category,
    type,
    link,
    houseTitle,
    tagList
    } = req.body;
  const image = req.files;

  const postImageKey = image.map((postImageKey) => postImageKey.key);
  const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
  const thumbnailKEY = postImageKey[0];
  const thumbnailURL = postImageUrl[0];

  let isLike = false;

  const postInfo = await posts.create({
    userId,
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
    isLike: isLike,
  });

  postImageKey.forEach((element, i) => {
    const postImageKEY = postImageKey[i];
    const postImageURL = postImageUrl[i];
    console.log(postImageKEY, postImageURL);
    
    if (image) {
      const imagesInfo = images.create({
        userId: userId,
        nickname: nickname,
        postId: postInfo.postId,
        thumbnailURL: thumbnailURL.toString(),
        thumbnailKEY: thumbnailKEY.toString(),
        postImageURL: postImageURL,
        postImageKEY: postImageKEY,
        userImageURL: userImageURL
      })
      console.log(imagesInfo);
      return imagesInfo
    }
  });
    res.status(201).send({ postInfo, postImageUrl, thumbnailURL });
  } catch(e) {
    res.status(402).json({ errorMessage : "게시글이 등록되지 않았습니다."});
  }
}


// 게시글 전체 조회
async function GetPostingList(req, res) {
  const user = res.locals;
  let allPost = await posts.findAll({
    include: [{
      model: images,
      required: true,
      attributes: ['postId', 'postImageURL', 'thumbnailURL', 'userImageURL']
    }],
  });

  for (i = 0; i < allPost.length; i++) {
    let post = allPost[i];
    const postComments = await Comments.findAll({
      where: { postId: post.postId },
    });

    const postLikes = await Like.findAll({ 
      where: { postId: post.postId } 
    });
    
    let islike = await Like.findOne({
      where: { userId: post.userId, postId: post.postId },
    });

    const likeNum = postLikes.length;
    const commentNum = postComments.length;
      // console.log("불린 전", userId, post.postId, i, "번째값입니다");
    if (islike) {
      islike = true;
    } else {
      islike = false;
    }
    Object.assign(post, {
      likeNum: likeNum,
      commentNum: commentNum,
      islike: islike,
    });
  }
  res.send({ allPost });
}


// 게시글 상세 조회
async function GetPost(req, res) {
  const { postId } = req.params;
    const allPost = await posts.findAll({
      where: { postId },
      include: [{
        model: images,
        required: false,
        attributes: ['postId', 'postImageURL', 'thumbnailURL', 'userImageURL'],
    },{
      model: Comments,
      required: false,
      attributes: ['postId', 'comment']
    },{
      model: Like,
      required: false,
      attributes: ['userId', 'postId']
    }]
  });
  console.log(allPost);

  for (i = 0; i < allPost.length; i++) {
    let post = allPost[i];
    const postComments = await Comments.findAll({ where: { postId: post.postId } });
    const postLikes = await Like.findAll({ where: { postId: post.postId } });
    
    let islike = await Like.findOne({
      where: { userId: post.userId, postId: post.postId },
    });

    const likeNum = postLikes.length;
    const commentNum = postComments.length;

    if (islike) {
      islike = true;
    } else {
      islike = false;
    }

    Object.assign(post, {
      likeNum: likeNum,
      commentNum: commentNum,
      islike: islike,
    });
  }

  res.send({ allPost });
 }


// 게시글 수정 (S3 기능 추가 예정)
async function ModifyPosting(req, res) {
  const { userId, userImageURL, nickname } = res.locals;
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
    tagList
    } = req.body;
  const image = req.files;

  // images DB에서 Key 찾아오기
  const postImageInfo = await images.findAll({
    where:{ postId }
  });

  const postImageKey = postImageInfo.map((postImageKey) => postImageKey.postImageKEY);
  console.log(postImageKey);

  postImageKey.forEach((element, i) => {
    const postImageKEY = postImageKey[i];

    if (postId) {
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
    }
  });

  // image KEY값, URL 배열 만들기
  const PostImageKey = image.map((postImageKey) => postImageKey.key);
  const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
  const thumbnailKEY = postImageKey[0];
  const thumbnailURL = postImageUrl[0];
  // console.log(postImageKey);

  // images DB 수정
  const ModifyImage = await images.update({
    postImageKEY:PostImageKey.toString(),
    postImageURL:postImageUrl.toString(),
    thumbnailKEY:thumbnailKEY.toString(),
    thumbnailURL:thumbnailURL.toString()
  }, {
    where: { postId }
  })

  // posts DB 수정
  const ModifyPost = await posts.update({
    title:title,
    content:content,
    mainAddress:mainAddress,
    subAddress:subAddress,
    category:category,
    type:type,
    link:link,
    houseTitle:houseTitle,
    tagList:tagList
  },{
    where: { postId },
  });

  // console.log(ModifyImage);
  res.status(200).send({ ModifyPost, ModifyImage, msg: "게시글이 수정되었습니다!" })
};


// 게시글 삭제 (S3 이미지 삭제 기능 추가 예정)
async function DeletePost(req, res) {
  const { userId, nickname } = res.locals;
  const { postId } = req.params;
  console.log(postId);

  const postImageInfo = await images.findAll({
    where:{ postId }
  });

  const postImageKey = postImageInfo.map((postImageKey) => postImageKey.postImageKEY);
  console.log(postImageKey);

  postImageKey.forEach((element, i) => {
    const postImageKEY = postImageKey[i];

    if (postId) {
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
    }
  });

  const destroyLike = await Like.destroy({ where: { postId } });
  const destroyComment = await Comments.destroy({ where: { postId } });
  const destroyImages = await images.destroy({ where: { postId } });
  const destroyPost = await posts.destroy({ where: { postId } });

  res.status(200).send({ postImageInfo, msg: "게시글이 삭제되었습니다!" });
}
module.exports.WritePosting = WritePosting;
module.exports.GetPostingList = GetPostingList;
module.exports.GetPost = GetPost;
module.exports.ModifyPosting = ModifyPosting;
module.exports.DeletePost = DeletePost;
