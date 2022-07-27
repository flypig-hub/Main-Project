const jwt = require("jsonwebtoken");
const { users, images, sequelize, Sequelize } = require("../models");
require("dotenv").config();

module.exports = async (req, res, next) => {
  const { authorization } = req.headers;

  const [tokenType, tokenValue] = authorization.split(" ");

  try {
    const { userId } = jwt.verify(tokenValue, process.env.MY_KEY);
    console.log("userId", userId);
    const loginuser = await users.findOne({ where: { userId } });
    const loginuserImage = await images.findOne({ where: { userId } });
    res.locals.userId = loginuser.userId;
    res.locals.nickname = loginuser.nickname;
    res.locals.host = loginuser.host;
    res.locals.email = loginuser.email;
    res.locals.userImageURL = loginuserImage.userImageURL;

    next();
  } catch {
    next();
  }
};
