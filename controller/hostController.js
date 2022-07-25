const {
    posts,
    Comments,
    Like,
    users,
    images,
    hosts,
    sequelize,
    Sequelize,
  } = require("../models");
  const multiparty = require("multiparty");
  const AWS = require("aws-sdk");

// 호스트 숙소 게시글 작성
async function hostCreateAcc(req, res) {
    const { userId, nickname, userImageURL } = res.locals;
    const host = res.locals.host
    if (host != true) {
        res.send({ errorMessage : "호스트가 아닙니다!" })
    };
    const { 
        title,
        category,
        houseinfo,
        mainAddress,
        subAddress,
        stepSelect,
        stepInfo,
        link,
        hostContent,
        tagList 
    } = req.body;
    console.log(req.body);
    const image = req.files;

    const createAcc = await hosts.create({
        title,
        category,
        houseinfo,
        mainAddress,
        subAddress,
        stepSelect,
        stepInfo,
        link,
        hostContent,
        tagList
    });

    // S3 이미지 등록 및 images DB 저장
    const postImageKey = image.map((postImageKey) => postImageKey.key);
    const postImageUrl = image.map((postImageUrl) => postImageUrl.location);
    const thumbnailKEY = postImageKey[0];
    const thumbnailURL = postImageUrl[0];
    console.log(postImageKey);

    postImageKey.forEach((element, i) => {
        const postImageKEY = postImageKey[i];
        const postImageURL = postImageUrl[i];
        console.log(postImageKEY, postImageURL);
        
        if (image) {
            const imagesInfo = images.create({
                userId: userId,
                nickname: nickname,
                thumbnailURL: thumbnailURL.toString(),
                thumbnailKEY: thumbnailKEY.toString(),
                postImageURL: postImageURL,
                postImageKEY: postImageKEY,
                userImageURL: userImageURL,  
            }, { 
                include: [{
                    association: hosts,
                    include: { hostId: element.hostId }
                }]
            })
        } else {
            res.send({ msg: "숙소 등록이 완료되었습니다!" })
        }
    });
    res.status(201).send({ createAcc, msg: "숙소 등록이 완료되었습니다!" })
};



// 호스트 숙소 게시글 전체 조회





// 호스트 숙소 게시글 상세 조회





// 호스트 숙소 게시글 수정





// 호스트 숙소 게시글 삭제




module.exports.hostCreateAcc = hostCreateAcc;