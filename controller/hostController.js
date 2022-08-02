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
            console.log(postImageKEY);
            console.log(postImageURL);
            
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
    
      queryData.search === "Northarea"
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
    : queryData.search === "Eastarea"
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

// 호스트 숙소 게시글 전체 조회 - 별점순
async function getAllACC_Star(req, res) {
  let queryData = res.locals;
  if (queryData.userId === undefined)
  {queryData.userId = 0}

  try {
    const findAllAcc = await hosts.findAll(
      {include : [{
        model : images,
        attributes : ['hostID' , 'postImageURL']
      }],
      order : [["average", "DESC"]],

      }
    );
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
    
  }

}


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

  try {
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
      },
       {where:{hostId:findAllAcc.hostId}}
     )
    }
    else {
      Object.assign(findAllAcc,{
        isSave:isSave,
      })
      
    }
    res.status(200).send({ findAllAcc})
  } catch (error) {
     res.status(400).send({errorMessage : "호스트 숙소 상세 조회 실패"})
  }
  
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

async function hostsearch(req, res) {
  try {
    const querydata = req.query;
    const searchResult = await hosts.findAll({
      where: {
        [Op.or]: [
          {
            hostContent: {
              [Op.substring]: querydata.search,
            },
          },
          {
            title: {
              [Op.substring]: querydata.search,
            },
          },
          {
            mainAddress: {
              [Op.substring]: querydata.search,
            },
          },
          { houseInfo: querydata.search },
        ],
      },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: images,
          required: false,
          attributes: [
            "hostId",
            "postImageURL",
            "thumbnailURL",
            "userImageURL",
          ],
        },
      ],
    });
    const findbyaddress = await hosts.findAll({
      Attributes: ["hostId"],
      where: {
        [Op.or]: [
          {
            mainAddress: {
              [Op.substring]: querydata.search,
            },
          },
          { houseInfo: querydata.search },
        ],
        order: [["createdAt", "DESC"]],
      },
    });
    
    const findbytitle = await hosts.findAll({
      Attributes: ["hostId"],
      where: {
        title: {
          [Op.substring]: querydata.search,
        },
      },
      order: [["createdAt", "DESC"]],
    });

    for (j = 0; j < searchResult.length; j++) {
      let host = searchResult[j];
      if (host.hostId == findbytitle.roomId) {
        searchResult[j] = searchResult[0];
        searchResult[0] = host;
      }
    }
    for (l = 0; l < searchResult.length; l++) {
      let host = searchResult[l];
      if (host.hostId == findbyaddress.roomId) {
        searchResult[l] = searchResult[0];
        searchResult[0] = host;
      }
    }

    res.status(200).send({ findAll, msg: "타입 검색이 완료되었습니다." });
  } catch (error) {
    res.status(400).send({ findAll, msg: "호스트 검색에 실패하였습니다.." });
  }
}


module.exports.deleteAcc = deleteAcc
module.exports.hostCreateAcc = hostCreateAcc;
module.exports.getAllAcc = getAllAcc;
module.exports.getDetailAcc = getDetailAcc;
module.exports.updateAcc = updateAcc;
module.exports.hostAddresssearch = hostAddresssearch;
module.exports.hosTypesearch = hosTypesearch;
module.exports.getAllACC_Star = getAllACC_Star;
module.exports.hostsearch = hostsearch;


// 호스트 숙소 등록 수정
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
        existImages,        // { KEY : URL }
        deleteImages
    } = req.body;
    const image = req.files;
    console.log(image.length, "이미지 몇장 들어오나요??");
    console.log(req.body.existImages, "기존의 이미지입니다.");
    console.log(req.body.deleteImages, "사진을 삭제합니다.");

      // 삭제할 이미지 KEY, URL 나눠서 배열화
      const deleteinfo2 = req.body.deleteImages.replaceAll(" ", "");
      const deleteinfo3 = deleteinfo2.replaceAll("postImageURL:", "");
      const deleteinfo4 = deleteinfo3.replaceAll("postImageKEY:", "");
      const deleteInfo = deleteinfo4.replaceAll("'", "").split(',')
      // deleteImages 배열화
      let deleteKEY = [];
      let deleteURL = [];
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
      console.log(deleteKEY, "삭제할 이미지KEY 배열화");
      console.log(deleteURL, "삭제할 이미지URL 배열화");

    // DB 삭제
    const destroyKEY = await images.findAll({
      where: { hostId },
      attributes: [ 'postImageKEY', 'postImageURL' ]
    })
    let imagesDestroyKEY = [];
    let imagesDestroyURL = [];
    for (let i = 0; i < deleteInfo.length / 2; i++) {
      if ( i < 0 ) {
        deleteInfo[0] = deleteInfo[1]
      } else {
        let deleteKey = deleteInfo[i * 2 + 1];
        let deleteUrl = deleteInfo[i * 2];
        imagesDestroyKEY.push(deleteKey);
        imagesDestroyURL.push(deleteUrl);
      }
    }

    // 이미지 파일객체 map
    const postImagesKEY = image.map((postImageKey) => postImageKey.key);
    const postImagesURL = image.map((postImageUrl) => postImageUrl.location);
  
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
        where: { hostId },
        attributes: [ 'postImageURL' ],
      })
      for (let i = 0; i < deleteImages.length; i++) {
        if (deleteImages[i] === deleteURL[i]) {
          const destroyImage = await images.destroy({
            where: { postImageURL:imagesDestroyURL }
          })
        }
      }
      console.log("지나가는거 확인할게요");
    }

    // 삭제 전 미리 KEY, URL 획득하기
    const DBImagesInfo = await images.findAll({
      where: {hostId},
      attributes: [ 'postImageKEY', 'postImageURL' ]
    })
    const DBImagesKEY = [];
    const DBImagesURL = [];
    for (let i = 0; i < DBImagesInfo.length; i++) {
      let dbImagesKEY = DBImagesInfo[i].postImageKEY;
      let dbImagesURL = DBImagesInfo[i].postImageURL;
      DBImagesKEY.push(dbImagesKEY);
      DBImagesURL.push(dbImagesURL);
    }

    const existImage = req.body.existImages.replaceAll(" ", "");
    const existImage1 = existImage.replaceAll("postImageURL:", "");
    const existImage2 = existImage1.replaceAll("postImageKEY:", "");
    const existImageInfo = existImage2.replaceAll("'", "").split(',')
    console.log(existImageInfo);
    let existImageInfoKEY = [];
    let existImageInfoURL = [];
    for (let i = 0; i < existImageInfo.length / 2; i++) {
      if (i < 0) {
        existImageInfo[0] = existImageInfo[1]
      } else {
        let existImageInfoKey = existImageInfo[i * 2 + 1]
        let existImageInfoUrl = existImageInfo[i * 2]
        existImageInfoKEY.push(existImageInfoKey)
        existImageInfoURL.push(existImageInfoUrl)
      }
    }
    console.log(existImageInfoKEY, "클라이언트에서 받은 기존 이미지 KEY");
    console.log(existImageInfoURL, "클라이언트에서 받은 기존 이미지 URL");

    // 이미지 삭제 후 DB에서 삭제함
    const destroyImages = await images.destroy({ where: { hostId: hostId } });

    // URL 배열 전체 합치기
    const preAllPostImageKey = existImageInfoKEY.concat(postImagesKEY);
    const preAllPostImageUrl = existImageInfoURL.concat(postImagesURL);

    // 기존 이미지에서 삭제될 이미지 지우고 배열화
    const resImageKeyInfo = preAllPostImageKey.filter(x => !deleteKEY.includes(x))
    const resImageUrlInfo = preAllPostImageUrl.filter(x => !deleteURL.includes(x))
    console.log(resImageKeyInfo, "최종 KEY값");
    console.log(resImageUrlInfo, "최종 URL값");
  

    resImageKeyInfo.forEach((element, i) => {
      const updateImages = images.create({
        userId: userId,
        userImageURL:userImageURL,
        nickname: nickname,
        hostId: hostId,
        thumbnailURL: resImageUrlInfo[0],
        thumbnailKEY: resImageKeyInfo[0],
        postImageURL: resImageUrlInfo[i],
        postImageKEY: resImageKeyInfo[i],
      })
    })

    const updateHostAcc = await hosts.update({ 
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
    }, { where : { hostId:hostId } })

    // let newTagStr = '';
    // if (req.body.tagList) {
    //   const newTag = req.body.tagList.split(" ");
    //   newTagStr += newTag
  
    //   Object.assign(updateHostAcc, {
    //     tagList : newTagStr.split(',')
    //   })
    // }

    const updatedHostAcc = await hosts.findAll({
      where: { hostId },
      include: [{
        model: images,
        attributes: [ "postImageURL" ]
      }]
    })

    let newTagStr = [];
    if (req.body.tagList) {
      const newTag = req.body.tagList.split(" ");
      newTagStr.push(newTag)
  
      Object.assign(updatedHostAcc, {
        tagList : newTagStr
      })
    }

    res.send({ updatedHostAcc })
  } 
