require('dotenv').config();

const { access } = require('fs');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { users, sequelize, Sequelize } = require("../models");

module.exports = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_ID, // 구글 로그인에서 발급받은 REST API 키
                clientSecret: process.env.GOOGLE_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL, // 구글 로그인 Redirect URI 경로
                passReqToCallback: true,
            },
            async (request, accessToken, refreshToken, profile, done) => {
                console.log(
                    'google profile : ',
                    profile,
                    'access',
                    accessToken
                );
                try {
                    const exUser = await users.findOne({
                        // 구글 플랫폼에서 로그인 했고 & snsId필드에 구글 아이디가 일치할경우
                        where : {snsId: profile.id},
                    });
                    const exUserImg = await images.findOne({
                        where : {userImageURL: profile._json.properties.thumbnail_image}
                    })
                    console.log(exUserImg, '이미지 중복일때를 확인해야해')
                    // 이미 가입된 구글 프로필이면 성공
                    if (exUser && exUserImg) {
                        done(null, exUser, exUserImg); // 로그인 인증 완료
                    } else {
                        // 가입되지 않는 유저면 회원가입 시키고 로그인을 시킨다
                        const newUser = await users.create({
                            snsId: profile.id,
                            nickname: profile.displayName,
                            provider: 'google',
                            host : false,
                            email : profile.emails[0].value
                        });
                        const newUserImage = await images.create({
                            userId: newUser.userId,
                            userImageURL : profile.photos[0].value,
                        });
                        done(null, newUser, newUserImage); // 회원가입하고 로그인 인증 완료
                    }
                } catch (error) {
                    console.error(error);
                    done(error);
                }
            }
        )
    );
};