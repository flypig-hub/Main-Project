const jwt = require("jsonwebtoken");
const { users, images, sequelize, Sequelize } = require("../models");
require("dotenv").config();

module.exports = async (req, res, next) => {

  try {
  const { authorization } = req.headers;

    const [tokenType, tokenValue] = authorization.split(" ");
    
    const { userId } = jwt.verify(tokenValue, process.env.MY_KEY);
    console.log("userId", userId);
    const loginuser = await users.findOne({ where: { userId } });
    const loginuserImage = await images.findOne({ where: { userId } });
    res.session.userId = loginuser.userId;
    res.session.nickname = loginuser.nickname;
    res.session.host = loginuser.host;
    res.session.email = loginuser.email;
    res.session.userImageURL = loginuserImage.userImageURL;

    next();
  } catch {
    res.locals.userId = 0;
    res.locals.nickname = "손님";
    res.locals.host = "";
    res.locals.email = "";
    res.locals.userImageURL = "";
    next();
  }
};
