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
  posts.init({
    postId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    content: DataTypes.STRING,
    title: DataTypes.STRING,
    tripLocation: DataTypes.STRING,
    commentId: DataTypes.INTEGER,
    commentNum: DataTypes.INTEGER,
    likeNum: DataTypes.INTEGER,
    thumbnailString: DataTypes.STRING,
    thumbnailKEY: DataTypes.STRING,
    thumbnailURL: DataTypes.STRING,
    postImageString: DataTypes.STRING,
    postImageKEY: DataTypes.STRING,
    postImageURL: DataTypes.STRING,
    category: DataTypes.STRING,
    type: DataTypes.STRING,
    link: DataTypes.STRING,
    houseTitle: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'posts',
  });
  return posts;
};