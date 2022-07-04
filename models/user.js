'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
<<<<<<< HEAD:models/user.js
  User.init({
    email: DataTypes.STRING,
    nickname: DataTypes.STRING,
    password: DataTypes.STRING
=======
  Users.init({
    userId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    snsId: DataTypes.STRING,
    nickname: DataTypes.STRING,
    userImage: DataTypes.STRING
>>>>>>> 55d7a84a52e30bec02240e43a963896fb5f22f42:models/users.js
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};