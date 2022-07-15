'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Comments.init(
    {
      commentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: DataTypes.STRING,
      nickname: DataTypes.STRING,
      comment: DataTypes.STRING,
      postId: DataTypes.STRING,
      userImage: DataTypes.STRING,
    },
    {
      timestamp: true,
      sequelize,
      modelName: "Comments",
    }
  );
  return Comments;
};