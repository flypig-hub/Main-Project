const {
  posts,
  Comments,
  Like,
  users,
  images,
  hosts,
  reviews,
  saves,
  sequelize,
  Sequelize,
} = require("../models");
const multiparty = require("multiparty");
const AWS = require("aws-sdk");
const Op = Sequelize.Op;
const ImageController = require("./ImageController")



// 유저 게시글 작성
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

  const PreImages = req.body.preImages.replace(/\s'/g, "")
  let preImagesArr = PreImages.replaceAll("'", "").split(',')
  // console.log(preImagesArr);
  let newContent = req.body.content;
  for (let i = 0; i < image.length; i++) {
    let preIMG = preImagesArr[i]
    // console.log(preIMG);
    let ImGList = image[i].location
    newContent = newContent.replaceAll(`${ preIMG }`,`${ ImGList }`)
  }
  console.log(newContent);

  const postInfo = await posts.create({
    userId,
    nickname,
    title,
    content : newContent,
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
  });

  let newTagStr = '';
    if (req.body.tagList) {
    const newTag = req.body.tagList.split(" ");
    newTagStr += newTag

    Object.assign(postInfo, {
      tagList: newTagStr.split(',')
    });
  }

  const postImageKey = image.map((postImageKey) => postImageKey.key);
  const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
  const thumbnailKEY = postImageKey[0];
  const thumbnailURL = postImageUrl[0];

  // S3 별도 통신 중에는 썸네일만 저장
  if (image) {
    // const saveImage = await ImageController.PostImages(image, postInfo.postId);
    // const userImageSave = await images.update({
    //   userId: userId,
    //   userImageURL:userImageURL,
    //   nickname: nickname
    // }, {
    //   where: { postId : postInfo.postId}
    // })
    postImageKey.forEach((element, i) => {
      const postImageKEY = postImageKey[i];
      const postImageURL = postImageUrl[i];

      const saveImage = images.create({
      userId: userId,
      userImageURL:userImageURL,
      nickname: nickname,
      postId: postInfo.postId,
      thumbnailURL: thumbnailURL.toString(),
      thumbnailKEY: thumbnailKEY.toString(),
      postImageURL: postImageURL.toString(),
      postImageKEY: postImageKEY.toString(),
    })
  })
}

    
  res.status(201).send({ postInfo, postImageUrl, thumbnailURL });
  // } catch(e) {
  //   res.status(402).json({ errorMessage : "게시글이 등록되지 않았습니다."});
  // }
}


// 유저 커뮤니티 게시글 전체 조회
async function GetPostingList(req, res) {
  const user = res.locals;
  let queryData = res.locals;
  if (queryData.userId === undefined)
  {queryData.userId = 0}
  
  // Top 5 게시물
  let Top5 = await posts.findAll({
    include : [{
      model : images,
      required : true,
      attributes : ['postId' , 'thumbnailURL' , 'userImageURL']
    }],
    order : [[
      "likeNum", "DESC"
    ]],
    limit : 5,
    
  });
  const Top5post = Top5.map((tpost)=>({
    postId : tpost.postId,
    title : tpost.title,
    nickname : tpost.nickname,
    likeNum : tpost.likeNum,
    commentNum : tpost.commentNum,
    images : tpost.images
  }));
 
 
  let allPost = await posts.findAll({
    include: [{
      model: images,
      required: true,
      attributes: ['postId', 'postImageURL', 'thumbnailURL', 'userImageURL']
    }],
    order : [[
      "createdAt", "DESC"
    ]]
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
      where: { userId: queryData.userId, postId: post.postId },
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
    await posts.update(
      {likeNum: likeNum,
       commentNum: commentNum
      },
      {where:{postId:post.postId}})
  }
  res.send({Top5post, allPost });
}


// 유저 커뮤니티 게시글 상세 조회
async function GetPost(req, res) {
  const { postId } = req.params;
  let queryData = res.locals;
  
  if (queryData.userId === undefined)
  {queryData.userId = 0}
  const allPost = await posts.findAll({
    where: { postId },
    include: [
      {
        model: images,
        required: false,
        attributes: ["postId", "postImageKEY", "postImageURL", "thumbnailURL", "userImageURL"],
      },
      {
        model: Comments,
        required: false,
        attributes: ["postId", "comment"],
      },
      {
        model: Like,
        required: false,
        attributes: ["userId", "postId"],
      },
    ],
  });
  // console.log(allPost[0].houseTitle);

 
    const postComments = await Comments.findAll({
      where: { postId: allPost[0].postId },
    });
    const postLikes = await Like.findAll({ where: { postId: allPost[0].postId } });

    let islike = await Like.findOne({
      where: { userId: queryData.userId, postId: allPost[0].postId },
    });

    const likeNum = postLikes.length;
    const commentNum = postComments.length;

    if (islike) {
      islike = true;
    } else {
      islike = false;
    }

    // tagList 배열화
    let newTagStr = '';
    if (allPost[0].tagList) {
    const newTag = allPost[0].tagList.split(" ");
    console.log(newTag);
    newTagStr += newTag

      Object.assign(allPost[0], {
        tagList: newTagStr.split(',')
      });
    }
    
    Object.assign(allPost[0], {
      likeNum: likeNum,
      commentNum: commentNum,
      islike: islike,
    });
  await posts.update(
    {
      likeNum: likeNum,
      commentNum: commentNum,
      islike: islike,
    },
    { where: { postId: allPost[0].postId } }
  );
  
   const outherPosts = await posts.findAll({
    where: {
      userId: allPost[0].userId,
      postId: {
        [Op.ne]: postId,
      },
    },
    order: [["commentNum", "DESC"]],
    limit: 3,
    include: [
      {
        model: images,
        attributes: ["postId", "postImageURL", "thumbnailURL", "userImageURL"],
      },
    ],
  });
  for (i = 0; outherPosts.length > i; i++){
    const outherPost = outherPosts[i];
     const outherPostComments = await Comments.findAll({
       where: { postId: outherPost.postId },
     });
     const outherPostLikes = await Like.findAll({
       where: { postId: outherPost.postId },
     });

     let islike = await Like.findOne({
       where: { userId: queryData.userId, postId: outherPost.postId },
     });

     const likeNum = outherPostLikes.length;
     const commentNum = outherPostComments.length;

     if (islike) {
       islike = true;
     } else {
       islike = false;
    }
    
    await posts.update(
      {
        likeNum: likeNum,
        commentNum: commentNum
      },
      { where: { postId: allPost[0].postId } }
    );
   Object.defineProperties(outherPost.dataValues, {
      title: {
        enumerable: true,
      },
      content: {
        enumerable: false,
      },
      hostId: {
        enumerable: false,
      },
      commentId: {
        enumerable: false,
      },
      commentNum: { value: commentNum, enumerable: true },
      likeNum: { value: likeNum, enumerable: true },
      islike: { value: islike, enumerable: true },
      mainAddress: {
        enumerable: false,
      },
      subAddress: {
        enumerable: false,
      },
      category: {
        enumerable: false,
      },
      type: {
        enumerable: false,
      },
      link: {
        enumerable: false,
      },
      houseTitle: {
        enumerable: false,
      },
      tagList: {
        enumerable: false,
      },
      // preImages: {
      //   enumerable: false,
      // },
      createdAt: {
        enumerable: false,
      },
      updatedAt: {
        enumerable: false,
      },
    });
    
    
  }
  
    // 이 글에 나온 숙소 찾아오기
    let findHostId = await hosts.findAll({
    attributes: [ 'title', 'hostId' ],
    })
    
    let houseTitle = [];
    for (let i = 0; i < findHostId.length; i++) {
      let house = findHostId[i]
      houseTitle.push(house.title);
      
      let isSave = await saves.findOne({
        where :{hostId :house.hostId, userId: queryData.userId}
      });
      if (isSave) {
        isSave = true;
      } else {
        isSave = false;
      }
      Object.assign(house,{
          isSave:isSave,
          
       });
    }

  let findAllAcc = [];
  if (houseTitle.indexOf(allPost[0].houseTitle) != -1) {
    let findAllAcc = await hosts.findAll({
      where: { title: allPost[0].houseTitle },
      attritutes : [ 'hostId' ],
      include: [{
        model: images,
        required: false,
        attributes: ["postImageURL", "thumbnailURL"],
      }],
    })
    
    const findStar = await reviews.findAll({
      where:{ hostId: findAllAcc[0].hostId },
      attributes: ['starpoint']
    })


    starsum =[];
    for (i = 0; findStar.length > i; i++) {
     const star = findStar[i]
      starsum.push(star.dataValues.starpoint);
      }
    

      if (findStar.length){
        const numStar = findStar.length
        let averageStarpoint = starsum.reduce((a, b) => a + b) / numStar
        
        Object.assign(findAllAcc[0],{
          average: averageStarpoint,
          
       })

       await hosts.update(
        {average: averageStarpoint},
         {where:{hostId:findAllAcc[0].hostId}}
      )
    }
    res.send({ allPost, findAllAcc, outherPosts  });
  } else {
    res.send({ allPost, findAllAcc , outherPosts });
  }
}

  



// 유저 커뮤니티 게시글 수정
// async function ModifyPosting(req, res) {
//   const { userId, userImageURL, nickname } = res.locals;
//   const { postId } = req.params;
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
//     existImages
//     } = req.body;
//   const image = req.files;
//   console.log(image);

//   // posts DB 수정
//   const updatePost = await posts.update({
//     title:title,
//     content:content,
//     mainAddress:mainAddress,
//     subAddress:subAddress,
//     category:category,
//     type:type,
//     link:link,
//     houseTitle:houseTitle,
//     tagList:tagList
//   },{
//     where: { postId },
//   });

//   if (image.length > 0) {
//     // images DB에서 키값 찾아오기
//     const postImageInfo = await images.findAll({ where:{ postId } });
//     const postImageKey = postImageInfo.map((postImageKey) => postImageKey.postImageKEY);

//     // S3 사진 삭제. 업로드는 미들웨어
//     postImageKey.forEach((element, i) => {
//       const postImageKEY = postImageKey[i];
//       const s3 = new AWS.S3();
//       const params = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Delete: {
//           Objects: postImageKey.map(postImageKEY => ({ Key: postImageKEY })), 
//         }
//       };
//       s3.deleteObjects(params, function(err, data) {
//         if (err) console.log(err, err.stack); // error
//         else { console.log("S3에서 삭제되었습니다"), data }; // deleted
//       });
//     });

//     // images DB delete 
//     const deleteImages = await images.destroy({ where: { postId } })

//     // image KEY, URL 배열 만들기
//     const PostImagesKey = image.map((postImageKey) => postImageKey.key);
//     const postImagesUrl = image.map((postImageUrl) => postImageUrl.location);
//     const thumbnailKEY = PostImagesKey[0];
//     const thumbnailURL = postImagesUrl[0];

//     // images DB create
//     PostImagesKey.forEach((element, i) => {
//       const postImageKEY = PostImagesKey[i];
//       const postImageURL = postImagesUrl[i];
//       console.log(postImageKEY);
//       const imagesUpdate = images.create({
//         userId: userId,
//         nickname: nickname,
//         postId: postId,
//         thumbnailURL: thumbnailURL.toString(),
//         thumbnailKEY: thumbnailKEY.toString(),
//         postImageURL: postImageURL,
//         postImageKEY: postImageKEY,
//         userImageURL: userImageURL,
//       })
//     });
//     const tagListArr = req.body.tagList.split(",");
//     console.log("지나가나??");

//     const findPost = await posts.findAll({
//       where: { postId }
//     });
//     res.status(200).send({ findPost, tagListArr, postImagesUrl, msg: "게시글이 수정되었습니다!" });
//   } else {
//     const findImages = await images.findAll({
//       where: { postId },
//       attributes: ['postImageURL', 'thumbnailURL']
//     });
//     // console.log(findImages);
    
//     const tagListArr = req.body.tagList.split(",");
//     console.log(tagListArr);

//     const findPost = await posts.findAll({
//       where: { postId }
//     });
//     res.status(200).send({ findPost, tagListArr, findImages, msg: "게시글이 수정되었습니다!" });
//   };
// };


// 유저 커뮤니티 게시글 삭제
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
    tagList,
    existImages
    } = req.body;
  const image = req.files;

  const findImageInfo = await images.findAll({
    where: { postId },
    attributes: ['postImageKEY']
  })

  const deleteImages = await images.destroy({
    where: { postId }
  })

  // 기존 사진 전달값
  // existImages = [{
  // {hostId: 14, 
  // postImageURL: 'https://yushin-s3.s3.ap-northeast-2.amazonaws.com/images/67a02ae9-00f5-4492-8503-67b4d8788c3c.png', 
  // postImageKEY: 'images/67a02ae9-00f5-4492-8503-67b4d8788c3c.png'}
  // {hostId: 14, 
  // postImageURL: 'https://yushin-s3.s3.ap-northeast-2.amazonaws.com/images/60d5e3c5-10b7-48a6-95eb-8aa635c58de5.webp', 
  // postImageKEY: 'images/60d5e3c5-10b7-48a6-95eb-8aa635c58de5.webp'}
  // {hostId: 14, 
  // postImageURL: 'https://yushin-s3.s3.ap-northeast-2.amazonaws.com/images/452895a5-f23d-453a-8571-ba7438469c04.png', 
  // postImageKEY: 'images/452895a5-f23d-453a-8571-ba7438469c04.png'}
  // {hostId: 14, 
  // postImageURL: 'https://yushin-s3.s3.ap-northeast-2.amazonaws.com/images/a02e4056-7938-4a8a-a6dd-dfe431752eba.png', 
  // postImageKEY: 'images/a02e4056-7938-4a8a-a6dd-dfe4317}
  // }]
  
  console.log(typeof(existImages), "키값, URL 데이터 확인+++++++++++++++++++++++++++++++++++++++++++++");
  console.log(existImages[0].existImagesKEY);


  // 새로운 사진과 기존 사진을 더함
//   if (image) {
//     const PostImageKey = image.map((postImageKey) => postImageKey.key);
//     const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
//     const thumbnailKEY = PostImageKey[0];
//     const thumbnailURL = postImageUrl[0];

//     if (existImages) {
//       const existImagesKEY = Object.values(existImages)
//       const existImagesURL = Object.keys(existImages)
//       console.log(existImagesKEY, "키 값도 확인하기");
//       console.log(existImagesURL, "이거 테스트");
//       PostImageKey.push(existImagesKEY);
//       postImageUrl.push(existImagesURL);
//       // console.log(postImageUrl, "이건???");
//     }
//     console.log(PostImageKey, postImageUrl, "이건가???");

//     const postImageKey = findImageInfo.map((postImageKey) => postImageKey.postImageKEY);
//     postImageKey.forEach((element, i) => {
//     const postImageKEY = postImageKey[i];
//     const s3 = new AWS.S3();
//     const params = {
//       Bucket: process.env.AWS_BUCKET_NAME,
//       Delete: {
//         Objects: postImageKey.map(postImageKEY => ({ Key: postImageKEY })), 
//       }
//       };
//       s3.deleteObjects(params, function(err, data) {
//         if (err) console.log(err, err.stack); // error
//         else { console.log("S3에서 삭제되었습니다"), data }; // deleted
//       });
//     });

//     const deleteImages = await images.destroy({
//       where: { postId }
//     })
//     console.log(deleteImages, "DB 삭제 완료!");

//     PostImageKey.forEach((element, i) => {
//     const ImageKey = postImageKey[i];
//     const ImageURL = postImageUrl[i];

//     const imageSave = images.create({
//       userId: userId,
//       nickname: nickname,
//       postId: postId,
//       postImageKEY : ImageKey,
//       postImageURL : ImageURL,
//       thumbnailKEY : thumbnailKEY,
//       thumbnailURL : thumbnailURL,
//       userImageURL
//     })
//   })
//   } else if (!image) {
//     // 추가되는 사진이 없고 기존 사진이 있음
//     let imageKEY = [];
//     let imageURL = [];
//     if (existImages) {
//       const existImagesKEY = Object.values(existImages)
//       const existImagesURL = Object.keys(existImages)

//       let PostImageKey = existImagesKEY.map((postImageKey) => postImageKey.key);
//       let postImageUrl = existImagesURL.map((postImageUrl) => postImageUrl.location);
//       let thumbnailKEY = PostImageKey[0];
//       let thumbnailURL = postImageUrl[0];
//       imageKEY.push(PostImageKey)
//       imageURL.push(postImageUrl)
//     }
//     // console.log(imageKEY, imageURL);

//     const deleteImages = await images.destroy({
//       where: { postId }
//     })

//     imageKey.forEach((element, i) => {
//       const ImageKey = imageKEY[i];
//       const ImageURL = imageURL[i];
  
//       const imageSave = images.create({
//         userId: userId,
//         nickname: nickname,
//         postId: postId,
//         postImageKEY : ImageKey.toString(),
//         postImageURL : ImageURL.toString(),
//         thumbnailKEY : thumbnailKEY,
//         thumbnailURL : thumbnailURL,
//         userImageURL
//       })
//   })
// }

//   // 이전 사진 + 새로운 사진 풀어서 DB 저장
//   const tagListArr = req.body.tagList.split(",");

//   const updatePost = await posts.update({
//         title:title,
//         content:content,
//         mainAddress:mainAddress,
//         subAddress:subAddress,
//         category:category,
//         type:type,
//         link:link,
//         houseTitle:houseTitle,
//         tagList:tagListArr
//       },{
//         where: { postId },
//       });

//   const checkPost = await posts.findAll({
//     where: { postId },
//     include: [{
//       model: images,
//       attributes: [ 'postImageKEY', 'postImageURL', 'thumbnailKEY', 'thumbnailURL' ]
//     }]
//   })

  res.send({ existImages })
}
