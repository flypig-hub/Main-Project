const {
  posts,
  Comments,
  Like,
  users,
  images,
  hosts,
  reviews,
  sequelize,
  Sequelize,
} = require("../models");
const multiparty = require("multiparty");
const AWS = require("aws-sdk");
const Op = Sequelize.Op;



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
    // console.log(req.body.content);
  const image = req.files;

  const tagListArr = new Array(tagList)
  console.log(tagListArr);

  let isLike = false;

    // let beforeImg = [];
    // let afterImg = [];
    // const PreImages = req.body.preImages.replace(/\s'/g, "")
    // let preImagesArr = PreImages.split(',')

    // let resultString = ''

    // let newArr = preImagesArr.map((element, i) => {
    //   let preImg = preImagesArr[i].substr(0, 63);
    //   let imgList = image[i].location;
    //   console.log(preImg);
    //   console.log(imgList);

    //   const newContent = req.body.content.replaceAll(
    //     `${preImagesArr[i].substr(0, 63)}`,
    //     `${image[i].location}`
    //   )
    //   resultString += newContent
    //   console.log(resultString);
    // })

    // for (let i = 0; i < preImagesArr.length; i++) {
    //     let preImg = preImagesArr[i].substr(0, 63)
    //     let imgList = image[i].location
    //     console.log(preImg);
    //     console.log(imgList);
    //     beforeImg.push(preImg);
    //     afterImg.push(imgList);
    //     const beforeImages = beforeImg.toString().split(',');
    //     console.log('이미지 바꾸기 전',beforeImages[beforeImages.length - 1]);
    //     const afterImages = afterImg.toString().split(',');
    //     console.log('이미지 바꾼 후', afterImages[afterImages.length - 1]);
    //     const newContent = req.body.content.replaceAll(`${ preImagesArr[i].substr(0, 63) }`,`${ image[i].location }`)
      
    //   console.log(newContent);
    // }
    

    // const ContentString = Content.toString()
    // console.log(ContentString);

    
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
    tagList,
    preImages
  });

  const postImageKey = image.map((postImageKey) => postImageKey.key);
  const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
  const thumbnailKEY = postImageKey[0];
  const thumbnailURL = postImageUrl[0];

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
res.status(201).send({ postInfo, tagListArr, postImageUrl, thumbnailURL });
  // } catch(e) {
  //   res.status(402).json({ errorMessage : "게시글이 등록되지 않았습니다."});
  // }
}


// 유저 커뮤니티 게시글 전체 조회
async function GetPostingList(req, res) {
  const user = res.locals;
  let queryData = req.query;
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
  console.log(Top5, '이미지 오나요');
  const Top5post = Top5.map((tpost)=>({
    postId : tpost.postId,
    title : tpost.title,
    nickname : tpost.nickname,
    likeNum : tpost.likeNum,
    commentNum : tpost.commentNum,
    images : tpost.images
  }));
  console.log(Top5post, '이거 맞나');

  // console.log(Top5, '이거 찍히나');
 
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
  let queryData   = req.query;
  if (queryData.userId === undefined)
  {queryData.userId = 0}
  const allPost = await posts.findAll({
    where: { postId },
    include: [
      {
        model: images,
        required: false,
        attributes: ["postId", "postImageURL", "thumbnailURL", "userImageURL"],
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
    let newTaglist = [];
    if (allPost[0].tagList) {
    const newTag = allPost[0].tagList.split(" ");
    console.log(newTag, "이거 확인");
    newTaglist.push(newTag)
    }
    console.log(newTaglist);
    
    Object.assign(allPost[0], {
      likeNum: likeNum,
      commentNum: commentNum,
      islike: islike,
      tagList: newTaglist
    });
  await posts.update(
    {
      likeNum: likeNum,
      commentNum: commentNum,
      islike: islike,
    },
    { where: { postId: allPost[0].postId } }
  );
  

  작성자의 다른 숙소 보여주기
   const outherPosts = await posts.findAll({
    where: {
      userId: post[0].userId,
      postId: {
        [Op.ne]: postId,
      },
    },
    order: [["likeNum", "DESC"]],
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
    
    Object.assign(post, {
      likeNum: likeNum,
      commentNum: commentNum,
      islike: islike,
    });
    await posts.update(
      {
        likeNum: likeNum,
        commentNum: commentNum,
        islike: islike
      },
      { where: { postId: post.postId } }
    );
    Object.defineProperties(outherPost, {
      content: {
        enumerable: false,
      },
      commentId: {
        enumerable: false,
      },
      commentNum: { value: commentNum, enumerable: true },
      likeNum: { value: likeNum, enumerable: false },
      islike: { value: islike, enumerable: false },
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
      preImages: {
        enumerable: false,
      },
    });
    
  }
  
    // 이 글에 나온 숙소 찾아오기
    let findHostId = await hosts.findAll({
    attributes: [ 'title' ],
    })
    // console.log(findHostId[0].title);
    let houseTitle = [];
    for (let i = 0; i < findHostId.length; i++) {
      let housetitle = findHostId[i].title
      houseTitle.push(housetitle);
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
         average: averageStarpoint
       })

       await hosts.update(
         {average: averageStarpoint},
         {where:{hostId:findAllAcc[0].hostId}}
      )
    }
    res.send({ allPost, findAllAcc });
  } else {
    res.send({ allPost, findAllAcc });
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
    tagList
    } = req.body;
  const image = req.files;
  console.log(image);

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

  if (image.length > 0) {
    // images DB에서 키값 찾아오기
    const postImageInfo = await images.findAll({ where:{ postId } });
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
    const tagListArr = req.body.tagList.split(",");
    console.log("지나가나??");

    const findPost = await posts.findAll({
      where: { postId }
    });
    res.status(200).send({ findPost, tagListArr, postImagesUrl, msg: "게시글이 수정되었습니다!" });
  } else {
    const findImages = await images.findAll({
      where: { postId },
      attributes: ['postImageURL', 'thumbnailURL']
    });
    // console.log(findImages);
    
    const tagListArr = req.body.tagList.split(",");
    console.log(tagListArr);

    const findPost = await posts.findAll({
      where: { postId }
    });
    res.status(200).send({ findPost, tagListArr, findImages, msg: "게시글이 수정되었습니다!" });
  };
};


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
