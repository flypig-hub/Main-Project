require('dotenv').config();
const { users } = require('../models/index');
const passport = require('passport');
const google = require('./google');
const kakao = require('./kakao');
const naver = require('./naver');

module.exports = () => {
    // passport.serializeUser((users, done) => {
    //     done(null, users.userId);
    // });

    // passport.deserializeUser((userId, done) => {
    //     users.findOne({ where: { userId } })
    //         .then(users => done(null, users))
    //         .catch(err => done(err));
    // });
  
  
  
  
    passport.serializeUser((users, done) => {
        console.log(users, '여기는 잘 나옴')
        // req.login(user, ...)의 user가 넘어와 값을 이용할수 있다.
        // console.log('직렬화', user[0].userId);
        done(null, users);
    });
    passport.deserializeUser((users, done) => {
        // req.session에 저장된 사용자 아이디를 바탕으로 DB 조회로 사용자 정보를 얻어낸 후 req.user에 저장.
        // 즉, id를 sql로 조회해서 전체 정보를 가져오는 복구 로직이다.
        console.log('역직렬화', users);
        done(null, users);
    });


    
    // passport.serializeUser(function(user, done) {
    //     done(null, user.id);
    //   });

    //   passport.deserializeUser(function(id, done) {
    //     User.findOne(id, function (err, user) {
    //       done(err, user);
    //     });
    //   });

    google();
    kakao();
    naver();
};