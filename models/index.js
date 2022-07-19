'use strict';
const express = require('express')
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require('../config/config.json')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    console.log(__dirname, file);
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });
 

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

const posts = sequelize.define('posts');
const images = sequelize.define('images');
posts.hasMany(images);
images.belongsTo(posts);

// db.posts = require("./posts")(sequelize, Sequelize);
// db.users = require("./users")(sequelize, Sequelize);
// db.Comments = require("./comments")(sequelize, Sequelize);
// db.images = require("./images")(sequelize, Sequelize);
// db.like = require("./like")(sequelize, Sequelize);

// db.posts.hasMany(db.Comments, { as: "Comments" });
// db.Comments.belongsTo(db.posts, {
//   foreignKey: "postId",
//   as: "posts"
// });

// db.posts.hasMany(db.images, { as: "images" });
// db.images.belongsTo(db.posts, {
//   foreignKey: "postId",
//   as: "posts"
// });

module.exports = db;

// =====================================
// MySQL DB Join Query
// SELECT
// 	posts.postId,
//     images.postNumber,
// 	images.postImageURL
// FROM posts LEFT OUTER JOIN images
// ON posts.postId = images.postNumber
// =====================================