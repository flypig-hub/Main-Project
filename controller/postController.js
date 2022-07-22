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
        postNumber: postInfo.postId,
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
      attributes: ['postNumber', 'postImageURL', 'thumbnailURL', 'userImageURL']
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
        attributes: ['postNumber', 'postImageURL', 'thumbnailURL', 'userImageURL'],
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
  // try {
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
  } = req.body;
  const image = req.files;

  const existPost = await posts.findOne({
    where: { postId },
  });

  if (image) {
    // S3 이미지 삭제 후 업로드



    await images.findByIdAndUpdate({
      postImageKEY,
    })
  } else {
    // 이미지가 없으면 existPost에서 찾은 이미지를 가져다 쓴다
  }

  const existImage = await images.findOne({
    where: { postId }
  })

  if (userId !== existPost.userId) {
    res.status(400).send({ errorMessage: "접근 권한이 없습니다!" });
  }

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
    thumbnailURL: thumbnailURL.toString(),
    // thumbnailKEY,
    // postImageURL: postImageURL.toString(),
    // postImageKEY: postImageKEY.toString(),
  });
  console.log(ModifyPost);

  res.status(200).send({ ModifyPost, msg: "게시글이 수정되었습니다!" });
  // } catch (e) {
  //     res.status(400).send({ errorMessage: "게시글을 수정을 할 수 없습니다." });
  // }
}

// 게시글 삭제 (S3 이미지 삭제 기능 추가 예정)
async function DeletePost(req, res) {
  // try {
  const { userId, nickname } = res.locals;
  const { postId } = req.params;
  console.log(postId);

  const postImageInfo = await images.findAll({
    where:{ postNumber: postId }
  });
  // console.log(postImageInfo);

  const postImageKey = postImageInfo.map((postImageKey) => postImageKey.postImageKEY);
  console.log(postImageKey);

  postImageKey.forEach((element, i) => {
    const postImageKEY = postImageKey[i];
    // console.log(postImageKEY);
    
    if (postId) {
    const s3 = new AWS.S3();
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Delete: {
          Objects: postImageKey.map(postImageKEY => ({ Key: postImageKEY })), 
        }
      };
      // console.log(params.Delete)

      s3.deleteObjects(params, function(err, data) {
        if (err) console.log(err, err.stack); // error
        else { console.log("S3에서 삭제되었습니다"), data }; // deleted
      });
    }
  });

  

  // if (existPost) {
  //   const s3 = new AWS.S3();
  //   const params = {
  //       Bucket: process.env.AWS_BUCKET_NAME,
  //       Delete: { Objects: [{ Key: `images/${fileName}` }] }
  //   };
  //   console.log(params.Delete);

  //   s3.deleteObjects(params, function(err, data) {
  //     if (err) console.log(err, 's3 deleteObject', data);
  //     else { console.log("삭제되었습니다.", data) }
  //   })
  // }

  // for (i = 0; i < fileName.length; i++) {
  //   let deleteImages = fileName[i]; 
  //   s3.deleteObjects({
  //   Bucket: process.env.AWS_BUCKET_NAME,
  //   Delete: {
  //        Objects: `images/${deleteImages}`
  //   }
  //   }, function (err, data) {
  //     if (err) { throw err; }
  //     console.log('s3 deleteObject', data);
  //   });
  // }
  

  // 댓글, 게시글 삭제
  // if (nickname !== existPost.nickname) {
  //     res.send({msg: "삭제할 수 없습니다."})
  // };
  const destroyLike = await Like.destroy({ where: { postId } });
  const destroyComment = await Comments.destroy({ where: { postId } });
  const destroyImages = await images.destroy({ where: { postNumber: postId } });
  const destroyPost = await posts.destroy({ where: { postId } });

  res.status(200).send({ postImageInfo, msg: "게시글이 삭제되었습니다!" });
  // } catch (e) {
      // res.status(400).send({ errorMessage: "접근 권한이 없습니다!"});
}
module.exports.WritePosting = WritePosting;
module.exports.GetPostingList = GetPostingList;
module.exports.GetPost = GetPost;
module.exports.ModifyPosting = ModifyPosting;
module.exports.DeletePost = DeletePost;
