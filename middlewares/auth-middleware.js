const jwt = require("jsonwebtoken");
const { users, sequelize, Sequelize } = require("../models");

module.exports = (req, res, next) => {
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
        users.findByPk({ userId }).then((users) => {
                res.locals.users = users;
                next();
            });
    } catch (error) {
        console.error(error);
        res.status(401).send({
            errorMEssage: '로그인 하시고 사용하세요',
        });
        return;
    }
};