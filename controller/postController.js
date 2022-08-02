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
const ImageController = require("./ImageController");
const { isTypedArray } = require("util/types");


// 유저 게시글 작성
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
    tagList,
    preImages             // 이미지보다 1개 적다, +1 해서 반복문 돌리기
    } = req.body;
  const image = req.files;
  // console.log(image);

  let isLike = false;

  const PreImages = req.body.preImages.replace(/\s'/g, "")
  let preImagesArr = PreImages.replaceAll("'", "").split(',')
  let newContent = req.body.content;
  for (let i = 1; i < image.length; i++) {
    let preIMG = preImagesArr[i - 1]
    let ImGList = image[i].location
    newContent = newContent.replaceAll(`${ preIMG }`,`${ ImGList }`)
  }

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

  if (image) {
    postImageKey.forEach((element, i) => {
      const postImageKEY = postImageKey[i];
      const postImageURL = postImageUrl[i];
      console.log(postImageKEY);
      console.log(postImageURL);
    
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
  } catch(e) {
    res.status(400).json({ errorMessage : "게시글이 등록되지 않았습니다."});
  }
}


// 유저 커뮤니티 게시글 전체 조회
async function GetPostingList(req, res) {
  const user = res.locals;
  let queryData = res.locals;
  if (queryData.userId === undefined)
  {queryData.userId = 0}
  
  // Top 5 게시물
  let Top5 = await posts.findAll({
    include : [
      {
      model : images,
      required : true,
      attributes : ['postId' , 'thumbnailURL' , 'userImageURL']
      },
      {
        model : users,
        attributes : ['nickname']
      }
    ],
    order : [[
      "likeNum", "DESC"
    ]],
    limit : 5,
    
  });
  // const Top5post = Top5.map((tpost)=>({
  //   postId : tpost.postId,
  //   title : tpost.title,
  //   nickname : tpost.nickname,
  //   likeNum : tpost.likeNum,
  //   commentNum : tpost.commentNum,
  //   images : tpost.images
  // }));
 
 
  let allPost = await posts.findAll({
    include: [
      {
      model: images,
      required: true,
      attributes: ['postId', 'postImageURL', 'thumbnailURL', 'userImageURL']
     },
     {
      model:users,
      attributes : ['nickname']
     }
  ],
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
       commentNum: commentNum,
       islike: islike,
      },
      {where:{postId:post.postId}})
  }
  res.send({Top5, allPost });
}


// 유저 커뮤니티 게시글 상세 조회
async function GetPost(req, res) {
  const { postId } = req.params;
  let queryData = res.locals;
  
  if (queryData.userId === undefined)
  {queryData.userId = 0}
  const allPostInfo = await posts.findAll({
    where: { postId },
    include: [
      {
        model: images,
        required: false,
        attributes: ["postImageKEY", "postImageURL"],
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
      {
        model: users,
        required: false,
        attributes: ["userImageURL", 'nickname'],
      },
    ],
  });
  console.log(allPostInfo[0].tagList);

  // tagList 배열화
  let newTagStr = '';
  if (allPostInfo[0].tagList.length) {
    const newTag = allPostInfo[0].tagList.split(" ");
    console.log(newTag);
    newTagStr += newTag
  } 
  const newTAG = newTagStr.split(',')

  const postComments = await Comments.findAll({
    where: { postId: allPostInfo[0].postId },
  });
  const postLikes = await Like.findAll({ where: { postId: allPostInfo[0].postId } });

  let islike = await Like.findOne({
    where: { userId: queryData.userId, postId: allPostInfo[0].postId },
  });

  const likeNum = postLikes.length;
  const commentNum = postComments.length;

  if (islike) {
    islike = true;
  } else {
    islike = false;
  }
  
  Object.assign(allPostInfo[0], {
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
  { where: { postId: allPostInfo[0].postId } }  
);


  const allPost = allPostInfo.map((postInfo) =>({
    postId : postInfo.postId,
    userId : postInfo.userId,
    nickname : postInfo.user.nickname,
    userImageURL : postInfo.user.userImageURL,
    content : postInfo.content,
    title : postInfo.title,
    commentId : postInfo.commentId,
    commentNum : postInfo.commentNum,
    likeNum : postInfo.likeNum,
    islike : postInfo.islike,
    mainAddress : postInfo.mainAddress,
    subAddress : postInfo.subAddress,
    category : postInfo.category,
    type : postInfo.type,
    link : postInfo.link,
    houseTitle : postInfo.houseTitle,
    tagList : newTAG,
    createdAt : postInfo.createdAt,
    updatedAt : postInfo.updatedAt,
    images : postInfo.images
  })); 
 
  console.log(allPost,'로그');

 


//글쓴이의 다른 게시물
  
   const outherPosts = await posts.findAll({
    where: {
      userId: allPostInfo[0].userId,
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
      {
        model : users,
        attributes : ['nickname']
      }
    ],
  });
  const outherPostInfo = outherPosts.map((outherpostinfo) =>({
    postId : outherpostinfo.postId,
    userId : outherpostinfo.userId,
    nickname : outherpostinfo.user.nickname,
    title : outherpostinfo.title,
    commentNum : outherpostinfo.commentNum,
    likeNum : outherpostinfo.likeNum,
    islike : outherpostinfo.islike,
    preImages : outherpostinfo.preImages,
    images : outherpostinfo.images
   }));


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
        commentNum: commentNum,
        islike:islike
      },
      { where: { postId: allPostInfo[0].postId } }
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
      await hosts.update(
        {isSave:isSave,},
        {where :{hostId : findHostId[0].hostId} }
      )
    }

  let findAllAcc = [];
  if (houseTitle.indexOf(allPostInfo[0].houseTitle) != -1) {
    let findAllAcc = await hosts.findAll({
      where: { title: allPostInfo[0].houseTitle },
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

    
    // // console.log(allPostInfo);
 
    // //  console.log(outherPostInfo);
    res.send({ allPost, findAllAcc, outherPostInfo  });
  } else {
    res.send({ allPost, findAllAcc , outherPostInfo });
  }
}

  



// 유저 커뮤니티 게시글 수정
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
    preImages,       // blob값
    deleteImages,    // 키값 형태: 배열(길이 - KEY : 47 / URL : 62)
    changeThumbnail 
  } = req.body;
  const image = req.files; // 4장
  console.log(req.body.deleteImages, "삭제할 이미지");
  console.log(req.body.preImages, "프리이미지스어쩌구");
  console.log(image.length, "이미지 몇개 왔는지?");

  let deleteKEY = [];
  let deleteURL = [];
  if (deleteImages) {
    // 키 값은 S3 삭제, URL은 DB 삭제
    const deleteinfo = req.body.deleteImages.replace(/\s'/g, "")
    const deleteinfo2 = deleteinfo.replaceAll(" ", "");
    const deleteinfo3 = deleteinfo2.replaceAll("postImageURL:", "");
    const deleteinfo4 = deleteinfo3.replaceAll("postImageKEY:", "");
    const deleteInfo = deleteinfo4.replaceAll("'", "").split(',')
    // deleteImages 배열화
    for (let i = 0; i < deleteInfo.length / 2; i++) {
      if ( i < 0 ) {
        deleteInfo[0] = deleteInfo[1]
      } else {
        let deleteKey = deleteInfo[i * 2 + 1];
        let deleteUrl = deleteInfo[i * 2];
        deleteKEY.push(deleteKey);
        deleteURL.push(deleteUrl);
      }
    }
  }
  console.log(deleteKEY, "지나가는지 확인");

  // 썸네일을 위해 삭제되기 전에 DB에서 미리 찾아둠
  const getThumnailInfo = await images.findAll({
    where: { postId: postId },
    attributes: [ "thumbnailURL", "thumbnailKEY", 'postImageKEY', 'postImageURL' ]
  })
  let imagesInfoURL = [];
  let imagesInfoKEY = [];
  for (let i = 0; i < getThumnailInfo.length; i++) {
    let getThumnailInfoKEY = getThumnailInfo[i].postImageKEY;
    let getThumnailInfoURL = getThumnailInfo[i].postImageURL;
    imagesInfoKEY.push(getThumnailInfoKEY)
    imagesInfoURL.push(getThumnailInfoURL)
  }

  // 이미지 파일객체 map
  const postImagesKEY = image.map((postImageKey) => postImageKey.key);
  const postImagesURL = image.map((postImageUrl) => postImageUrl.location);

  // content 중 blob 값을 대체
  const PreImage = req.body.preImages.replace(/\s'/g, "")
  let preImagesArr = PreImage.replaceAll("'", "").split(',')
  let newContent = req.body.content;
  for (let i = 1; i < image.length; i++) {
    let preIMG = preImagesArr[i - 1]
    let ImGList = image[i].location
    newContent = newContent.replaceAll(`${ preIMG }`,`${ ImGList }`)
  }

  // DB 삭제
  const destroyKEY = await images.findAll({
    where: { postId },
    attributes: [ 'postImageKEY', 'postImageURL' ]
  })
  let imagesDestroyKEY = [];
  let imagesDestroyURL = [];
  for (let i = 0; i < destroyKEY.length; i++) {
    let imagesDestroyKey = destroyKEY[i].postImageKEY;
    let imagesDestroyUrl = destroyKEY[i].postImageURL;
    imagesDestroyKEY.push(imagesDestroyKey)
    imagesDestroyURL.push(imagesDestroyUrl)
  }

  if (deleteImages) {
    // AWS S3 삭제 코드
    const s3 = new AWS.S3();
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Delete: {
        Objects: imagesDestroyKEY.map(imagesDestroyKEY => ({ Key: imagesDestroyKEY })), 
      }
    };
    s3.deleteObjects(params, function(err, data) {
      if (err) console.log(err, err.stack); // error
      else { console.log("S3에서 삭제되었습니다"), data }; // deleted
    });

    // URL 받아서 DB와 비교, 삭제
    const deleteDB = await images.findOne({
      where: { postId },
      attributes: [ 'postImageURL' ],
    })
  }

  const destroyImages = await images.destroy({ where: { postId: postId } });

  // URL 배열 전체 합치기
  const allPostImageKey = imagesInfoKEY.concat(postImagesKEY);
  const allPostImageUrl = imagesInfoURL.concat(postImagesURL);
  // 전체 배열 합에서 삭제 이미지 제거
  const resImageKeyInfo = allPostImageKey.filter(x => !deleteKEY.includes(x))
  const resImageUrlInfo = allPostImageUrl.filter(x => !deleteURL.includes(x))
  console.log(resImageKeyInfo, "최종 키값");
  console.log(resImageUrlInfo, "최종 URL");


  // 상황 1. 사진이 추가되고 썸네일 수정 있음, 이미지의 0번째는 썸네일
  if (changeThumbnail) {  
    const thumnailUrl = image[0].location;
    const thumnailKey = image[0].key;
    console.log("썸네일 바꿔서 사진을 수정합니다");
    postImagesKEY.forEach((element, i) => {
      const postImageKEY = postImagesKEY[i];
      const postImageURL = postImagesURL[i];
      const updateImages = images.create({
        userId: userId,
        userImageURL:userImageURL,
        nickname: nickname,
        postId: postId,
        thumbnailURL: thumnailUrl,
        thumbnailKEY: thumnailKey,
        postImageURL: postImageURL,
        postImageKEY: postImageKEY,
      })
    })
  }

  // 상황 2. 사진이 추가되고 썸네일 수정 없음
  if (!changeThumbnail) {
    console.log("썸네일 없이 사진을 수정합니다");
    postImagesKEY.forEach((element, i) => {
      const postImageKEY = postImagesKEY[i];
      const postImageURL = postImagesURL[i];
      const updateImages = images.create({
        userId: userId,
        userImageURL:userImageURL,
        nickname: nickname,
        postId: postId,
        thumbnailURL: imagesInfoURL[0],
        thumbnailKEY: imagesInfoKEY[0],
        postImageURL: postImageURL,
        postImageKEY: postImageKEY,
      })
    })
  }

  const postUpdate = await posts.update({
    userId: userId,
    nickname: nickname,
    title: title,
    content : newContent,
    mainAddress: mainAddress,
    subAddress: subAddress,
    category: category,
    type: type,
    link: link,
    houseTitle: houseTitle,
    tagList
  }, {
    where: { postId: postId }
  })

  const postInfo = await posts.findAll({
    where: { postId: postId },
    include : [{
      model: images,
      attributes: [ "postImageURL", "thumbnailURL" ]
    }]
  });

  let newTagStr = '';
  if (req.body.tagList) {
    const newTag = req.body.tagList.split(" ");
    newTagStr += newTag

    Object.assign(postInfo, {
      tagList : newTagStr.split(',')
    })
  }
  console.log(postInfo.tagList);

  res.send({ postInfo })
}


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