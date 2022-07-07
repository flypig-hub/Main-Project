const jwt = require("jsonwebtoken");
const { users, sequelize, Sequelize } = require("../models");

//카카오 로그인

const kakaoCallback = (req, res, next) => {
    passport.authenticate('kakao',{ failureRedirect: '/' },
    (err, users) => {
            if (err) return next(err)
            console.log('콜백')
            const { userId, nickname, userImage } = users;
            const token = jwt.sign({ userId }, process.env.MY_KEY)

            result = {
                userId,
                token,
                nickname,
                userImage,
            }
            console.log('카카오 콜백 함수 결과', result)
            res.send({ user: result })
        }
    )(req, res, next)
}



// 구글 로그인

const googleCallback = (req, res, next) => {
  passport.authenticate(
      'google',
      { failureRedirect: '/' },
      (err, users, info) => {
          if (err) return next(err)
          console.log('콜백')
          const { userId, nickname, userImage } = users
          const token = jwt.sign({ userId }, process.env.MY_KEY)

          result = {
              userId,
              token,
              nickname,
              userImage
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
      (err, users, info) => {
          if (err) return next(err)
          console.log('콜백')
          const { userId, nickname, userImage } = users
          const token = jwt.sign({ userId }, process.env.MY_KEY)

          result = {
              userId,
              token,
              nickname,
              userImage
          }
          console.log('네이버 콜백 함수 결과', result)
          res.send({ users: result })
      }
  )(req, res, next)
}



async function checkMe(req, res) {
    const { users } = res.locals;
    res.send({
      user:{
        userId : users.userId,
        nickname: users.nickname,
        email: users.email
      }
    });
  };


module.exports = {
  kakaoCallback, googleCallback, naverCallback,
  checkMe
}