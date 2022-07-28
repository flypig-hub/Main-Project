const {
    posts,
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
  const { Op } = require('sequelize');

// 호스트 숙소 게시글 작성
async function hostCreateAcc(req, res) {
    const { userId, nickname, userImageURL } = res.locals;
    
    const host = res.locals.host
    // try {
      if (host != true) {
        res.send({ errorMessage : "호스트가 아닙니다!" })
    };
    const { 
        title,
        category,
        houseInfo,
        mainAddress,
        subAddress,
        stepSelect,
        stepInfo,
        link,
        hostContent,
        tagList 
    } = req.body;
    const image = req.files;

    let tagListArr = [];
    if (req.body.tagList) {
      let tagListArray = tagList.split(" ")
      tagListArr.push(tagListArray)
    }
    
    const createAcc = await hosts.create({
      // postId,
      userId,
      title,
      category,
      houseInfo,
      mainAddress,
      subAddress,
      stepSelect,
      stepInfo,
      link,
      hostContent,
      tagList: tagListArr.toString(),
      isSave: false,
      average : 0,
    });

    if (image) {
        // S3 이미지 등록 및 images DB 저장
        const postImageKey = image.map((postImageKey) => postImageKey.key);
        const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
        const thumbnailKEY = postImageKey[0];
        const thumbnailURL = postImageUrl[0];
        
        postImageKey.forEach((element, i) => {
            const postImageKEY = postImageKey[i];
            const postImageURL = postImageUrl[i];
            
            const imagesInfo = images.create({
                userId: userId,
                nickname: nickname,
                hostId: createAcc.hostId,
                thumbnailURL: thumbnailURL.toString(),
                thumbnailKEY: thumbnailKEY.toString(),
                postImageURL: postImageURL,
                postImageKEY: postImageKEY,
                userImageURL: userImageURL,  
            })
        });

        const findAcc = await hosts.findAll({
          where: { hostId: createAcc.hostId }
        })

        if (req.body.tagList) {
          const tagListArr = tagList.split(" ")
          
        Object.assign(findAcc[0], {
          tagList: tagListArr
        })
        }
        
        res.status(201).send({ findAcc, postImageUrl, msg: "숙소 등록이 완료되었습니다!" })
    } 
    // } catch (error) {
    //   res.status(400).send({errorMessage : "호스트 숙소 게시글 작성 실패"})
    // }
};


//호스트 숙소 검색하기
async function hostAddresssearch(req, res) {
  const queryData = req.query;
  let key = {};
    
      queryData.search === "Eastarea"
    ? (key = {
        [Op.or]: [
          {
            mainAddress: {
              [Op.substring]: "제주시",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "조천읍",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "애월읍",
            },
          },
        ],
      })
    : queryData.search === "Westarea"
    ? (key = {
        [Op.or]: [
          {
            mainAddress: {
              [Op.substring]: "한림읍",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "한경면",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "대정읍",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "안덕면",
            },
          },
        ],
      })
    : queryData.search === "Southarea"
    ? (key = {
        [Op.or]: [
          {
            mainAddress: {
              [Op.substring]: "중문",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "서귀포시",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "남원읍",
            },
          },
        ],
      })
    : queryData.search === "Northarea"
    ? (key = {
        [Op.or]: [
          {
            mainAddress: {
              [Op.substring]: "구좌읍",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "성산읍",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "표선면",
            },
          },
          {
            mainAddress: {
              [Op.substring]: "우도면",
            },
          },
        ],
      })
    : (key = {});
    
  const hostPost = await hosts.findAll({
    where: key,
    include : [{
      model: images,
      attributes: [ 'hostId', 'postImageURL' ]
      }],
    order: [["createdAt", "DESC"]],
  });
  res.status(200).send({ msg: "숙소검색 완료", hostPost });
}
   
  // async function searchRoombyhashtag(req, res) {
  // const queryData = req.query;
  //   const rooms = await Rooms.findAll({where: {
  //          hashTag: { [Op.substring]: queryData.search }
  //   },
  //     order: [[
  //       "createdAt", "DESC"
  //     ]]
  //   });
  //   res.status(200).send({msg:"룸 해쉬태그 검색완료", rooms})
  // }
 

// 호스트 숙소 게시글 전체 조회
async function getAllAcc(req, res) {
  let queryData = res.locals;
  if (queryData.userId === undefined)
  {queryData.userId = 0}

  try {
    const findAllAcc = await hosts.findAll(
      {  include : [{
            model: images,
            attributes: [ 'hostId', 'postImageURL' ]
        }],
        order: [["createdAt", "DESC"]],
      }
       
    );
    //개별 객체 for문
    
    for ( j = 0 ; findAllAcc.length > j; j++ ){
      const hoststar = findAllAcc[j]
      
      
      const findStar = await reviews.findAll({
        where : {hostId :hoststar.hostId },
        attributes: ['starpoint']
      });
      
      // 별점 평균 for 문
      starsum =[];
      
      
      for (i = 0; findStar.length > i; i++) {
        const star = findStar[i]
        
        starsum.push(star.dataValues.starpoint);
        }
        let isSave = await saves.findOne({
          where :{hostId :hoststar.hostId, userId: queryData.userId}
        });
        
        if (isSave) {
          isSave = true;
        } else {
          isSave = false;
        }
        
    let averageStarpoint = 0   
  
        if (findStar.length){
          const numStar = findStar.length
          averageStarpoint = starsum.reduce((a, b) => a + b) / numStar
        }
  
        Object.assign(hoststar,{
          average: averageStarpoint,
          isSave:isSave
        })
        await hosts.update(
          {average: averageStarpoint,
            isSave:isSave},
          {where:{hostId:hoststar.hostId}}
          
        )
          // 위에 함수에 감아보자 String(starsum.reduce((a, b) => a + b) / numStar)
        averageStarpoint = String(averageStarpoint) 
    }
      res.status(200).send({ findAllAcc })
  } catch (error) {
    res.status(400).send({errorMessage : "호스트 숙소 게시글 전체 조회 실패"})
  }
  
  }



// 호스트 숙소 게시글 상세 조회
async function getDetailAcc(req, res) {
  const { hostId } = req.params; 
  let queryData = res.locals;
  if (queryData.userId === undefined)
  {queryData.userId = 0}

  // try {
    const findAllAcc = await hosts.findOne({
      where: { hostId },
      include : [{
          model: images,
          required: true,
          attributes: [ 'postImageURL', 'postImageKEY' ]
      }]
  });

  let isSave = await saves.findOne({
    where : {hostId : hostId, userId: queryData.userId}
  });
  
  if (isSave) {
    isSave = true;
  } else {
    isSave = false;
  }

  const findStar = await reviews.findAll({
    where:{hostId},
    attributes: ['starpoint']
  })



  starsum =[];
  for (i = 0; findStar.length > i; i++) {
   const star = findStar[i]
  starsum.push(star.dataValues.starpoint);
  }

  console.log(findAllAcc.tagList);
  if (findAllAcc.tagList) {
    const tagListArr = findAllAcc.tagList.split(",")
      console.log(tagListArr, "이거 확인하는거임");

      Object.assign(findAllAcc,{
        tagList: tagListArr
      })
  }
      
    
    if (findStar.length){
      const numStar = findStar.length
      let averageStarpoint = starsum.reduce((a, b) => a + b) / numStar
 
      Object.assign(findAllAcc,{
       average: averageStarpoint,
       isSave:isSave,
     })

     await hosts.update(
       {average: averageStarpoint,
        isSave:isSave
      },
       {where:{hostId:findAllAcc.hostId}}
     )
    }
    res.status(200).send({ findAllAcc})
  // } catch (error) {
  //   res.status(400).send({errorMessage : "호스트 숙소 상세 조회 실패"})
  // }
  
}



// 호스트 숙소 게시글 수정
// async function updateAcc(req, res) {
//     const { userId, nickname, userImageURL } = res.locals;
//     const { hostId } = req.params;
//     // try {
//       const findAcc = await hosts.findOne({ where: { hostId } })
//       if (userId !== findAcc.userId) {
//           res.send({ errorMessage: "작성자가 아닙니다!" })
//       }
  
//       const { 
//           title,
//           category,
//           houseInfo,
//           mainAddress,
//           subAddress,
//           stepSelect,
//           stepInfo,
//           link,
//           hostContent,
//           tagList 
//       } = req.body;
//       const image = req.files;

//       const tagListArr = tagList.split(" ")
  
//       const updateAcc = await hosts.update({
//           title,
//           category,
//           houseInfo,
//           mainAddress,
//           subAddress,
//           stepSelect,
//           stepInfo,
//           link,
//           hostContent,
//           tagList
//       },{
//           where: { hostId:hostId }
//       });
  
//       const updatedAcc = await hosts.findOne({
//           where: { hostId:hostId }
//       })

//       Object.assign(updatedAcc, {
//         tagList: tagListArr
//       })
  
//       if (image) {
//           // images DB에서 키값 찾아오기
//           const postImageInfo = await images.findAll({ where: { hostId } });
//           const postImageKey = postImageInfo.map((postImageKey) => postImageKey.postImageKEY);
      
//           // S3 사진 삭제. 업로드는 미들웨어
//           postImageKey.forEach((element, i) => {
//             const postImageKEY = postImageKey[i];
//             const s3 = new AWS.S3();
//             const params = {
//               Bucket: process.env.AWS_BUCKET_NAME,
//               Delete: {
//                 Objects: postImageKey.map(postImageKEY => ({ Key: postImageKEY })), 
//               }
//             };
//             s3.deleteObjects(params, function(err, data) {
//               if (err) console.log(err, err.stack); // error
//               else { console.log("S3에서 삭제되었습니다"), data }; // deleted
//             });
//           });
  
//           // images DB delete
//           const deleteImages = await images.destroy({ where: { hostId } })
      
//           // image KEY, URL 배열 만들기
//           const PostImagesKey = image.map((postImageKey) => postImageKey.key);
//           const postImagesUrl = image.map((postImageUrl) => postImageUrl.location);
//           const thumbnailKEY = PostImagesKey[0];
//           const thumbnailURL = postImagesUrl[0];
          
      
//           // images DB create
//           PostImagesKey.forEach((element, i) => {
//             const postImageKEY = PostImagesKey[i];
//             const postImageURL = postImagesUrl[i];
            
//             const imagesUpdate = images.create({
//               userId: userId, 
//               nickname: nickname,
//               hostId: hostId,
//               thumbnailURL: thumbnailURL.toString(),
//               thumbnailKEY: thumbnailKEY.toString(),
//               postImageURL: postImageURL,
//               postImageKEY: postImageKEY,
//               userImageURL: userImageURL
//             })
//           });
//           res.status(200).send({ updatedAcc, postImagesUrl, msg: "게시글이 수정되었습니다!" });
//         }
//     // } catch (error) {
//     //   res.status(400).send({errorMessage : "게시물 수정 실패"})
//     // }
   
// }



// 호스트 숙소 게시글 삭제
async function deleteAcc(req, res) {
    const { userId, nickname } = res.locals;
    const { hostId } = req.params;
 try {
  const findAcc = await hosts.findOne({ where: { hostId } })
  if (userId !== findAcc.userId) {
      res.send({ errorMessage: "작성자가 아닙니다!" })
  }

  const postImageInfo = await images.findAll({
    where:{ hostId }
  });

  const postImageKey = postImageInfo.map((postImageKey) => postImageKey.postImageKEY);
  

  postImageKey.forEach((element, i) => {
    const postImageKEY = postImageKey[i];

    if (hostId) {
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

  const destroyHost = await hosts.destroy({ where: { hostId } });
  const destroyImages = await images.destroy({ where: { hostId } });

  res.status(200).send({ msg: "게시글이 삭제되었습니다!" });
 } catch (error) {
  res.status(400).send({errorMessage : "게시글 삭제 실패"})
 }
   
  }

async function hosTypesearch(req, res) {
const querydata = req.query
 const housebyType = await hosts.findAll({
   where: { houseInfo: querydata.search },
   include: [
     {
       model: images,
       required: false,
       attributes: ["hostId", "postImageURL", "thumbnailURL", "userImageURL"],
     },
   ],
   order: [["createdAt", "DESC"]],
 });


res.status(200).send({housebyType, msg: "타입 검색이 완료되었습니다." });
}

// 숙소 타입별 검색 api
async function hostsearch(req, res) {
const queryData = req.query;
const hostPost = await hosts.findAll({where: {
    [Op.or]: [
      { title: { [Op.substring]: queryData.search } },
      { hostContent: { [Op.substring]: queryData.search } },
    ],
},
  order: [[
    { title: { [Op.substring]: queryData.search } },"createdAt", "DESC"
  ]]
});
res.status(200).send({msg:"숙소검색 완료", hostPost})
};

module.exports.deleteAcc = deleteAcc
module.exports.hostCreateAcc = hostCreateAcc;
module.exports.getAllAcc = getAllAcc;
module.exports.getDetailAcc = getDetailAcc;
module.exports.updateAcc = updateAcc;
module.exports.hostAddresssearch = hostAddresssearch;
module.exports.hosTypesearch = hosTypesearch;
module.exports.hostsearch = hostsearch;

// 게시글 수정( 수정 중 )
async function updateAcc(req, res) {
  const { userId, nickname, userImageURL } = res.locals;
  const { hostId } = req.params;
  // try {
    const findAcc = await hosts.findOne({ where: { hostId } })
    if (userId !== findAcc.userId) {
        res.send({ errorMessage: "작성자가 아닙니다!" })
    }

    const { 
        title,
        category,
        houseInfo,
        mainAddress,
        subAddress,
        stepSelect,
        stepInfo,
        link,
        hostContent,
        tagList,
        existImages
    } = req.body;
    const image = req.files;

    // 기존 사진 KEY, URL 찾기
    if (existImages) {
    const findImageURL = await images.findAll({
      where: { hostId },
      attributes: ['postImageURL']
    })
    const findImageKEY = await images.findAll({
      where: { hostId },
      attributes: ['postImageKEY']
    })

    let imageKEY = [];
    let imageURL = [];
    let newImageKEY = [];
    let newImageURL = [];
    for (let i = 0; i < findImageURL.length; i++) {
      let KEY = findImageKEY[i].postImageKEY;
      let URL = findImageURL[i].postImageURL;
      imageKEY.push(KEY);
      imageURL.push(URL);

      let newImageKey = image[i].key;
      let newImageUrl = image[i].location;
      newImageKEY.push(newImageKey)
      newImageURL.push(newImageUrl)
    }
    console.log(imageKEY, imageURL);
    console.log(newImageKEY, newImageURL, "이거 화ㅓㄱ인");

    // 추가되는 새로운 사진
    // const postImageKey = image.map((postImageKey) => postImageKey.key);
    // const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
    // const thumbnailKEY = postImageKey[0];
    // const thumbnailURL = postImageUrl[0]; 

    Object.assign(postImageKey, {
      findImageURL:findImageURL
    })

    const KEY = findImageKEY.toString()
    const URL = findImageURL.toString()

    res.send({ findImageURL, findImageKEY, postImageUrl })
  }
}

    

    // 기존 사진 전달값
    // existImages = [{
    // {postImageURL: 'https://yushin-s3.s3.ap-northeast-2.amazonaws.com/images/67a02ae9-00f5-4492-8503-67b4d8788c3c.png', 
    //  postImageKEY: 'images/67a02ae9-00f5-4492-8503-67b4d8788c3c.png'}
    // {postImageURL: 'https://yushin-s3.s3.ap-northeast-2.amazonaws.com/images/60d5e3c5-10b7-48a6-95eb-8aa635c58de5.webp', 
    //  postImageKEY: 'images/60d5e3c5-10b7-48a6-95eb-8aa635c58de5.webp'}
    // {postImageURL: 'https://yushin-s3.s3.ap-northeast-2.amazonaws.com/images/452895a5-f23d-453a-8571-ba7438469c04.png', 
    //  postImageKEY: 'images/452895a5-f23d-453a-8571-ba7438469c04.png'}
    // {postImageURL: 'https://yushin-s3.s3.ap-northeast-2.amazonaws.com/images/a02e4056-7938-4a8a-a6dd-dfe431752eba.png', 
    //  postImageKEY: 'images/a02e4056-7938-4a8a-a6dd-dfe4317}
    // }]


    // ====== 기존 사진 중 일부 유지, 사진 추가  ======
  //   if (existImages) {
  //     let stringCut = existImages.slice(3, -4)
  //     let stringCut2 = stringCut.replaceAll("{", "")
  //     let stringCut3 = stringCut2.replaceAll("}", "")
  //     let stringCut4 = stringCut3.replaceAll("'", "")
  //     let stringCut5 = stringCut4.replaceAll(",", "")
  //     let stringCut6 = stringCut5.replaceAll("postImageURL:", "")
  //     let stringCut7 = stringCut6.replaceAll("postImageKEY:", "")
  //     let stringCut8 = stringCut7.trim().split("  ");
  //     let imageKEY = [];
  //     let imageURL = [];
  //     for (let i = 0; i < stringCut8.length/2; i++) {
  //       let stringCut9 = stringCut8[i * 2]
  //       let stringCut10 = stringCut8[i * 2 + 1]
  //       imageURL.push(stringCut9)
  //       imageKEY.push(stringCut10)
  //       }
  //       console.log(imageKEY);
  //       console.log(imageURL);

  //   const findImages = await images.findAll({
  //     where: { hostId },
  //     attributes: ['postImageKEY', 'postImageURL']
  //   })

  // }
    


    // const tagListArr = tagList.split(" ")

    // const updateAcc = await hosts.update({
    //     title,
    //     category,
    //     houseInfo,
    //     mainAddress,
    //     subAddress,
    //     stepSelect,
    //     stepInfo,
    //     link,
    //     hostContent,
    //     tagList
    // },{
    //     where: { hostId:hostId }
    // });

    // const updatedAcc = await hosts.findOne({
    //     where: { hostId:hostId }
    // })

    // Object.assign(updatedAcc, {
    //   tagList: tagListArr
    // })

    //   res.status(200).send({ msg: "게시글이 수정되었습니다!" });
    // }
  // } catch (error) {
  //   res.status(400).send({errorMessage : "게시물 수정 실패"})
  // }
