const passport = require('passport');
const { Strategy: NaverStrategy, Profile: NaverProfile } = require('passport-naver-v2');
const { users, images, sequelize, Sequelize } = require("../models");
 
require('dotenv').config()
 
module.exports = () => {
   passport.use(
      new NaverStrategy(
         {
            clientID: process.env.NAVER_ID,
            clientSecret: process.env.NAVER_SECRET,
            callbackURL: process.env.NAVER_URL,
         },
         async (accessToken, refreshToken, profile, done) => {
            console.log('naver profile : ', profile);
            try {
               const exUser = await users.findOne({
                  // 네이버 플랫폼에서 로그인 했고 & snsId필드에 네이버 아이디가 일치할경우
                  where : {snsId: profile.id}, // where { userId: profile.id, provider: 'naver',}
               });
               const exUserImg = await images.findOne({
                  where : {userImageURL: profile.profileImage}
              })
              console.log(exUserImg, '이미지 중복일때를 확인해야해')
               // 이미 가입된 네이버 프로필이면 성공
               if (exUser && exUserImg) {
                  done(null, exUser, exUserImg);
               } else {
                  // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
                  const newUser = await users.create({
                     snsId: profile.id,
                     nickname: profile.name,    
                     provider: 'naver',
                     host : false,
                     email : profile.email,
                     userImageURL : profile.profileImage

                  });
                  const newUserImage = await images.create({
                     snsId: profile.id,
                     userId: newUser.userId,
                     userImageURL : profile.profileImage,
                 });
                 console.log(newUserImage, '이미지');
                  done(null, newUser, newUserImage);
               }
            } catch (error) {
               console.error(error);
               done(error);
            }
         },
      ),
   );
};