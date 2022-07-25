require('dotenv').config()

const jwt = require("jsonwebtoken");
const passport = require('passport');
const { images, posts, users, hosts, Like, saves, sequelize, Sequelize } = require("../models");
// const { users } = require('../models/index');
// const posts = require('../models/posts');
// const like = require('../models/like');
const axios = require('axios');
const { cache } = require('ejs');
// const save = require('../models/save');


//카카오 로그인
const kakaoCallback = (req, res, next) => {
        passport.authenticate(
        'kakao',
        
        { failureRedirect: '/' },
        (err, users, images, info) => {
          console.log(users, images,'여기서 문제가 발생하지요')
            if (err) return next(err)
            //----------------------------------------------------------------
            console.log('콜백')
            const { userImageURL } = images;
            const { userId, nickname, host, email } = users;
            const token = jwt.sign({ userId }, process.env.MY_KEY)

            result = {
                userId,
                token,
                nickname,
                userImageURL,
                host,
                email
            }
            console.log('카카오 콜백 함수 결과', result)
            res.send({ users: result })
        }
    )(req, res, next)
}



// 구글 로그인

const googleCallback = (req, res, next) => {
  passport.authenticate(
      'google',
      { failureRedirect: '/' },
      (err, users, images, info) => {
          if (err) return next(err)
          console.log('콜백')
          const { userImageURL } = images;
          const { userId, nickname, host, email } = users
          const token = jwt.sign({ userId }, 'mendorong-jeju')

          result = {
              userId,
              token,
              nickname,
              userImageURL,
              host,
              email
          }
          console.log('구글 콜백 함수 결과', result)
          res.send({ users: result })
      }
  )(req, res, next)
}




// 네이버 로그인

const naverCallback = (req, res, next) => {
  passport.authenticate(
      'naver',
      { failureRedirect: '/' },
      (err, users, images, info) => {
          if (err) return next(err)
          console.log('콜백')
          const { userImageURL } = images;
          const { userId, nickname, host, email } = users
          const token = jwt.sign({ userId }, process.env.MY_KEY)

          result = {
              userId,
              token,
              nickname,
              userImageURL,
              host,
              email
          }
          console.log('네이버 콜백 함수 결과', result)
          res.send({ users: result })
      }
  )(req, res, next)
}


//로그인 인증
async function checkMe(req, res) {
    const {userId, nickname, userImageURL, email, host}  = res.locals
    
  res.send({
      success:true,
      email,
      userId,
      nickname,
      userImageURL,
      host
    });
  };

// // 마이페이지 생성

// async function CreateMypage (req, res) {
//   const {userId} = res.locals
  
  
//   const mypageinf = await posts.findAll({
//     where : {userId}
//   })

//   const mypageinfmap = mypageinf.map((mypageinfo) =>({
//     nickname : mypageinfo.nickname,
//     title : mypageinfo.title,
//     commentNum : mypageinfo.commentNum,
//     likeNum : mypageinfo.likeNum,
//   }))
//   console.log(mypageinfmap,'여기가 포스트에서 가지고오는거');
//   const mypagecreate = await mypage.create({
//     mypageinfmap
//     // thumbnailURL,
//   })
//   // const thumbnail = await images.findAll({
//   //   where : {postId}
//   // })
//   console.log(mypageinfmap);
//   res.status(200).send({mypagecreate});
//   // res.json({
//   //   mypageinf
//   // })
// }


//마이페이지 정보 - 1
 async function Mypage (req, res) {
  const {userId} = res.locals;
  // const {nickname, userImageURL, host, email, userId} = res.locals;
  
  
  // 저장한 게시물
  const mysavelist = await saves.findAll({
    where : {userId},

  })
  // console.log(mylikelist, '좋아요 리스트 테스트');
  const mysavehost = []
  const mysaveinfo = mysavelist.map((saveinfo) =>(
  saveinfo.hostId));
  // console.log(mylikeinfo , 'mylikeinfo');
  for (i = 0; mysaveinfo.length > i; i++) {
      const savehost = await hosts.findOne ({
        where : {hostId : mysaveinfo[i]},
        include: [{
          model: images,
          attributes: ['hostId', 'thumbnailURL']
        }],
      })
      // console.log(likepost, '이거 찍히나?');
      const mysavehostlist = {
        title : savehost.title,
        commentNum : savehost.commentNum,
        likeNum : savehost.likeNum,
        images : savehost.images

      }
      console.log(mysavehostlist, '여기 찍어주세요');
      mysavehost.push(mysavehostlist);
   }
  
  // 좋아요 누른 게시물
  const mylikelist = await Like.findAll({
    where : {userId},

  })
  // console.log(mylikelist, '좋아요 리스트 테스트');
  const mylikespost = []
  const mylikeinfo = mylikelist.map((likeinfo) =>(
  likeinfo.postId));
  // console.log(mylikeinfo , 'mylikeinfo');
  for (i = 0; mylikeinfo.length > i; i++) {
      const likepost = await posts.findOne ({
        where : {postId : mylikeinfo[i]},
        include: [{
          model: images,
          attributes: ['postId', 'thumbnailURL']
        }],
      })
      // console.log(likepost, '이거 찍히나?');
      const mylikepostlist = {
        title : likepost.title,
        commentNum : likepost.commentNum,
        likeNum : likepost.likeNum,
        images : likepost.images

      }
      console.log(mylikepostlist, '여기 찍어주세요');
      mylikespost.push(mylikepostlist);
   }
   
  // 내가 쓴 게시물
  const mypostlist = await posts.findAll({
    where : {userId},
    include: [{
      model: images,
      attributes: ['postId', 'thumbnailURL']
    }],
    // attributes: ['postId', 'thumbnailURL'],

  });
  // console.log(mypostlist);
  const mypostinfo = mypostlist.map((postinfo) => ({
    title : postinfo.title,
    commentNum : postinfo.commentNum,
    likeNum : postinfo.likeNum,
    images : postinfo.images
  }))
  // 호스트 게시물
  const hostpost = await hosts.findAll({
    where : {userId},
    include: [{
      model: images,
      attributes: ['hostId', 'thumbnailURL']
    }]
  });
  const hostinfo = hostpost.map((hosts) =>({
    title : hosts.title,
    commentNum : hosts.commentNum,
    likeNum : hosts.likeNum,
    images : hosts.images
  }));

  // console.log(hostinfo,'호스트 게시물 불러오기');

  res.json({
    mypostinfo, // 내가 쓴 게시물 목록
    mylikespost, // 좋아요를 누른 게시물 목록
    hostinfo, // 호스트 등록 시, 호스트 유저로 쓴 호스트 게시물
    mysavehost // 마음에 든 호스트 게시물을 저장한 목록

    // mypostthumbnail
  })
 }




// 마이페이지 정보 수정
//닉네임
 async function MypagePutname (req, res) {
 try {
    const userId = res.locals.userId
    const {nickname} = req.body;

    
    const existnicName = await users.findOne({where : {nickname}});
    // const pnickname = await users.findOne({where : {userId}});
    // console.log(pnickname,'이거 찍히나');
    // console.log(pnickname.nickname,'닉네임');
    // if(pnickname.nickname == nickname) {
    //   return
    // }
    if(existnicName) {
      return res.status(400).send({result : false, errorMessage : "중복된 닉네임 사용중입니다."});

    }else{
      await users.update({nickname},{where:{userId}})
      res.status(200).send({nickname, result : true, message :"수정 완료"})
    }
  } catch (error) {
    res.status(400).send({result : false, errorMessage: "닉네임 수정 실패.",});
  }
 }

//프로필이미지 수정하기
 async function MypagePutImage (req, res) {

try {
  
  const image = req.files;
  const userId = res.locals.userId
  const userImageKEY = image.map((userImageKEY) => userImageKEY.key);
  const userImageURL = image.map((userImageURL) => userImageURL.location);
  console.log(userImageKEY, userImageURL, '업로드까지');
  const existImage = await images.findOne({where : {userId}})
  if (existImage) {
    const userImages = await images.update({userImageKEY: userImageKEY.toString(),userImageURL: userImageURL.toString()},
    {where :{userId},});
    res.status(200).send({userImages,userImageKEY, userImageURL, msg: "성공" })
  }  

}catch(error){
  res.status(400).send({result : false, errorMessage: "프로필사진 업데이트 실패",});
}
}




// 사업자등록번호 검증

async function CNU_CK (req, res, next) {
  const CNU = req.body.CNU;   //사업자 등록번호
  console.log(CNU)
  var data = {
    "b_no": [CNU], // 사업자번호 "xxxxxxx" 로 조회 시,
   }; 
  const CNU_CK = await postCRN(CNU);
  
   console.log(data)
  // Company Number check
  async function postCRN(crn){
    try {
      const postUrl = "https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=hsmMPV8Yvh7MAswqXiCCcM%2BlWTuetywv5slb0C2xYqLlwk1Qrqp%2BbChwrRIEvBHmVzPxy%2BR9%2FYcZ08ZUa65rHQ%3D%3D"

      const result  = await axios.post(postUrl,JSON.stringify(data),{ headers: { 'Content-Type': 'application/json' } }
      ).then((res) => { 
        return res.data.data[0].tax_type

      }).catch((err)=> {
        console.log(err)
      });
      if (result !== '국세청에 등록되지 않은 사업자등록번호입니다.'){
        const userId = res.locals.userId
        await users.update({host:true}, {where:{userId}})
        res.status(200).send({result : true, message :"멘도롱 제주의 호스트가 되셨습니다."})
      } else {
        res.status(404).send({result : true, message :"국세청에 등록되지 않은 사업자등록번호입니다."})
      }

      } catch (error) {
        console.error(error);
        res.status(404).send({
          errorMEssage: '국세청에 등록되지 않은 사업자등록번호입니다.',
      })
        return;
    }
  }
  next();
};

//다른 유저 정보 보기

async function otherUser (req, res) {
  const {userId} = req.params;
try {
  const otherpost = await posts.findAll({
    where : {userId:userId},
    include: [{
      model: images,
      attributes: ['postId', 'thumbnailURL']
    }],
  });
  console.log(otherpost,"이거 나오지?");
  const otherinfo = otherpost.map((o_post) =>({
    title : o_post.title,
    commentNum : o_post.commentNum,
    likeNum : o_post.likeNum,
    images : o_post.images
  }));
 // 해당 유저의 채팅방

  res.status(200).send({ otherinfo, msg : "다른 유저의 정보입니다."});
} catch (error) {
  res.status(400).send({ otherinfo, errorMEssage : "다른 유저의 정보를 가지고 올수 없습니다."});
}
  
  
}


module.exports = {
  kakaoCallback, googleCallback, naverCallback,
  checkMe, Mypage, MypagePutname, CNU_CK, MypagePutImage, otherUser
}