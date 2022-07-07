'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class posts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  posts.init(
    {
      postId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
    userId: DataTypes.STRING,
    postContent: DataTypes.STRING,
    title: DataTypes.STRING,
    tripLocation: DataTypes.STRING,
    commentId: DataTypes.INTEGER,
    commentNum: DataTypes.INTEGER,
    likeNum: DataTypes.INTEGER,
    thumbnailKEY: DataTypes.STRING,
    thumbnailURL: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'posts',
  });
  return posts;
};