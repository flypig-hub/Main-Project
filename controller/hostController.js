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
    try {
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

    const tagListArr = tagList.split(" ")

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
        Object.assign(findAcc[0], {
          tagList: tagListArr
        })
        res.status(201).send({ findAcc, postImageUrl, msg: "숙소 등록이 완료되었습니다!" })
    } 
    } catch (error) {
      res.status(400).send({errorMessage : "호스트 숙소 게시글 작성 실패"})
    }
};


//호스트 숙소 검색하기
async function hostsearch(req, res) {
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
        }]}
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

  try {
    const findAllAcc = await hosts.findOne({
      where: { hostId },
      include : [{
          model: images,
          required: true,
          attributes: [ 'hostId', 'postImageURL' ]
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

  const tagListArr = findAllAcc.tagList.split(',')
      console.log(tagListArr, "이거 확인하는거임");

      Object.assign(findAllAcc,{
        tagList: tagListArr
      })
    
    if (findStar.length){
      const numStar = findStar.length
      let averageStarpoint = starsum.reduce((a, b) => a + b) / numStar
 
      Object.assign(findAllAcc,{
       average: averageStarpoint,
       isSave:isSave,
       tagList: tagListArr
     })
     console.log(tagListArr, "상태 확인");
     await hosts.update(
       {average: averageStarpoint,
        isSave:isSave
      },
       {where:{hostId:findAllAcc.hostId}}
     )
    }
    res.status(200).send({ findAllAcc})
  } catch (error) {
    res.status(400).send({errorMessage : "호스트 숙소 상세 조회 실패"})
  }
  
}



// 호스트 숙소 게시글 수정
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
          tagList 
      } = req.body;
      const image = req.files;

      const tagListArr = tagList.split(" ")
  
      const updateAcc = await hosts.update({
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
      },{
          where: { hostId:hostId }
      });
  
      const updatedAcc = await hosts.findOne({
          where: { hostId:hostId }
      })

      Object.assign(updatedAcc, {
        tagList: tagListArr
      })
  
      if (image) {
          // images DB에서 키값 찾아오기
          const postImageInfo = await images.findAll({ where: { hostId } });
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
          const deleteImages = await images.destroy({ where: { hostId } })
      
          // image KEY, URL 배열 만들기
          const PostImagesKey = image.map((postImageKey) => postImageKey.key);
          const postImagesUrl = image.map((postImageUrl) => postImageUrl.location);
          const thumbnailKEY = PostImagesKey[0];
          const thumbnailURL = postImagesUrl[0];
          
      
          // images DB create
          PostImagesKey.forEach((element, i) => {
            const postImageKEY = PostImagesKey[i];
            const postImageURL = postImagesUrl[i];
            
            const imagesUpdate = images.create({
              userId: userId, 
              nickname: nickname,
              hostId: hostId,
              thumbnailURL: thumbnailURL.toString(),
              thumbnailKEY: thumbnailKEY.toString(),
              postImageURL: postImageURL,
              postImageKEY: postImageKEY,
              userImageURL: userImageURL
            })
          });
          res.status(200).send({ updatedAcc, postImagesUrl, msg: "게시글이 수정되었습니다!" });
        }
    // } catch (error) {
    //   res.status(400).send({errorMessage : "게시물 수정 실패"})
    // }
   
}



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


module.exports.deleteAcc = deleteAcc
module.exports.hostCreateAcc = hostCreateAcc;
module.exports.getAllAcc = getAllAcc;
module.exports.getDetailAcc = getDetailAcc;
module.exports.updateAcc = updateAcc;
module.exports.hostsearch = hostsearch;
