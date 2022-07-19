'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chats extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Chats.init(
    {
      chatId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userId: DataTypes.STRING,
      userNickname: DataTypes.STRING,
      chat: DataTypes.STRING,
      userImg: DataTypes.STRING,
    },
    {
      timestamp: true,
      sequelize,
      modelName: "Chats",
    }
  );
  return Chats;
};