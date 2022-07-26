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

async function WritePosting(req, res) {
  // try {
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
    tagList,
    preImages
    } = req.body;
  const image = req.files;

  let isLike = false;

  const postImageKey = image.map((postImageKey) => postImageKey.key);
  const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
  const thumbnailKEY = postImageKey[0];
  const thumbnailURL = postImageUrl[0];

    let Content = [];
    const PreImages = req.body.preImages
    // console.log(PreImages); //문자
    let preImagesArr = PreImages.split(',')
    // console.log(preImagesArr); //배열
    let newContent = content

    for (let i = 0; i < preImagesArr.length; i++) {
      let newContent = content.replace(`${ preImagesArr }`,`${ image[i].location }`)
      console.log(newContent, '지나가나요?');
      Content.push(newContent)
    }
    console.log(Content);

    const postInfo = await posts.create({
      userId,
      nickname,
      title,
      content: Content.toString(),
      mainAddress,
      subAddress,
      category,
      type,
      link,
      houseTitle,
      commentNum: 0,
      likeNum: 0,
      isLike: isLike,
      tagList,
      preImages
    });
    console.log(postInfo);

  if (image) {
    postImageKey.forEach((element, i) => {
      const postImageKEY = postImageKey[i];
      const postImageURL = postImageUrl[i];
      // console.log(postImageKEY, postImageURL)
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
    })
  }
    res.status(201).send({ postInfo, postImageUrl, thumbnailURL });
    }

  // } catch(e) {
  //   res.status(402).json({ errorMessage : "게시글이 등록되지 않았습니다."});
  // }


// 게시글 작성(유저)
// async function WritePosting(req, res) {
//   // try {
//   const { userId, nickname, userImageURL } = res.locals;
//   const {
//     title,
//     content,
//     mainAddress,
//     subAddress,
//     category,
//     type,
//     link,
//     houseTitle,
//     tagList,
//     preImages
//     } = req.body;
//   const image = req.files;

//   let isLike = false;

//     let Content = [];
//     const PreImages = req.body.preImages
//     // console.log(PreImages); //문자
//     let preImagesArr = PreImages.split(',')
//     // console.log(preImagesArr); //배열
//     let newContent = content

//     for (let i = 0; i < preImagesArr.length; i++) {

//       let newContent = content.replace(`${ preImagesArr }`,`${ image[i].location }`)
//       console.log(newContent, '지나가나요?');

//     }
//     const ContentString = Content.toString()
//     console.log(ContentString);

    
//   const postInfo = await posts.create({
//     userId,
//     nickname,
//     title,
//     content,
//     mainAddress,
//     subAddress,
//     category,
//     type,
//     link,
//     houseTitle,
//     commentNum: 0,
//     likeNum: 0,
//     isLike: isLike,
//     tagList,
//     preImages
//   });

//   const postImageKey = image.map((postImageKey) => postImageKey.key);
//   const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
//   const thumbnailKEY = postImageKey[0];
//   const thumbnailURL = postImageUrl[0];

// if (image) {
//   postImageKey.forEach((element, i) => {
//     const postImageKEY = postImageKey[i];
//     const postImageURL = postImageUrl[i];
//     // console.log(postImageKEY, postImageURL)
//     const imagesInfo = images.create({
//       userId: userId,
//       nickname: nickname,
//       postId: postInfo.postId,
//       thumbnailURL: thumbnailURL.toString(),
//       thumbnailKEY: thumbnailKEY.toString(),
//       postImageURL: postImageURL,
//       postImageKEY: postImageKEY,
//       userImageURL: userImageURL
//     })
//   })
// }
// res.status(201).send({ postInfo, postImageUrl, thumbnailURL });
//   // } catch(e) {
//   //   res.status(402).json({ errorMessage : "게시글이 등록되지 않았습니다."});
//   // }
// }


// 게시글 전체 조회
async function GetPostingList(req, res) {
  const user = res.locals;
  const {userId} = req.body;
  
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
      where: { userId: userId, postId: post.postId },
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
  const { userId } = req.body;
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
      where: { userId: userId, postId: post.postId },
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

  // posts DB 수정
  const updatePost = await posts.update({
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

  if (image) {
    // images DB에서 키값 찾아오기
    const postImageInfo = await images.findAll({ where:{ postId } });
    console.log(postImageInfo);
    const postImageKey = postImageInfo.map((postImageKey) => postImageKey.postImageKEY);

    // S3 사진 삭제. 업로드는 미들웨어
    postImageKey.forEach((element, i) => {
      const postImageKEY = postImageKey[i];
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

    // images DB delete 
    const deleteImages = await images.destroy({ where: { postId } })

    // image KEY, URL 배열 만들기
    const PostImagesKey = image.map((postImageKey) => postImageKey.key);
    const postImagesUrl = image.map((postImageUrl) => postImageUrl.location);
    const thumbnailKEY = PostImagesKey[0];
    const thumbnailURL = postImagesUrl[0];
    console.log(PostImagesKey);

    // images DB create
    PostImagesKey.forEach((element, i) => {
      const postImageKEY = PostImagesKey[i];
      const postImageURL = postImagesUrl[i];
      console.log(postImageKEY);
      const imagesUpdate = images.create({
        userId: userId,
        nickname: nickname,
        postId: postId,
        thumbnailURL: thumbnailURL.toString(),
        thumbnailKEY: thumbnailKEY.toString(),
        postImageURL: postImageURL,
        postImageKEY: postImageKEY,
        userImageURL: userImageURL,
      })
    });
    res.status(200).send({ updatePost, postImagesUrl, msg: "게시글이 수정되었습니다!" });
  } else {
    const findImages = await images.findAll({
      where: { postId }
    });
    console.log(findImages);
    res.status(200).send({ updatePost, findImages, msg: "수정된 내용이 없습니다!" });
  };
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
