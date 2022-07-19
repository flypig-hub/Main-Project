'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class images extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
    }
  }
  images.init({
    imageId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: DataTypes.STRING,
    userImage: DataTypes.STRING,
    nickname: DataTypes.STRING,
    postId: DataTypes.INTEGER,
    thumbnailKEY: DataTypes.INTEGER,
    thumbnailURL: DataTypes.INTEGER,
    postNumber: DataTypes.STRING,
    postImageKEY: DataTypes.STRING,
    postImageURL: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'images',
  });
  return images;
};