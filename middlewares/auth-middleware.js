const jwt = require("jsonwebtoken");
const { Users, sequelize, Sequelize } = require("../models");

module.exports = async (req, res, next) => {
    const { authorization } = req.headers;
    const [tokenType, tokenValue] = (authorization || "").split(' ');

    if (!tokenValue || tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: '로그인이 필요한 페이지 입니다.',
        });
        return;
    }
    try {
<<<<<<< HEAD
        const { userId } = jwt.verify(tokenValue, 'my-secret-key');
        const user = await Users.findById(userId);
=======
        const { userId } = jwt.verify(tokenValue, process.env.MY_KEY);
        const user = await UserDB.findById(userId);
>>>>>>> 55d7a84a52e30bec02240e43a963896fb5f22f42
        
        res.locals.user = user;
        next();

    } catch (error) {
        // 토큰이 없거나, 유효하지 않은 토큰인 경우 이쪽으로 접근.
        res.status(401).send({ errorMessage: '로그인이 필요한 페이지 입니다.' });
        return;
    }
};