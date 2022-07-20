const jwt = require("jsonwebtoken");
const { users, images, sequelize, Sequelize } = require("../models");

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
        res.status(401).send({
            errorMEssage: '로그인 후 사용하세요',
        });
        return;
    }
    if( authorization==='null' ){
        res.status(401).send({
            errorMEssage: '로그인 후 사용하세요!!',
        });
        return;
    }
    const [tokenType, tokenValue] = authorization.split(' ');

    if (tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요!',
        });
        return;
    }

    //jwt검증//
    try {
        const { userId } = jwt.verify(tokenValue, process.env.MY_KEY);
        //검증 성공시 locals에 인증 정보 넣어주기//
        console.log('userId',userId);
       const loginuser =  await users.findOne({ where: { userId }, });
        res.locals.userId = loginuser.userId
        res.locals.nickname = loginuser.nickname
        res.locals.userImage = loginuser.userImage
        res.locals.host = loginuser.host
        res.locals.email = loginuser.email
        next()
    } catch (error) {
        console.error(error);
        res.status(401).send({
            errorMEssage: '로그인 하시고 사용하세요',
        });
        return;
    }
};