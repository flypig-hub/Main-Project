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
      posts.hasMany(models.images, { foreignKey: 'postNumber', sourceKey: 'postId', onDelete: 'CASCADE' });
      posts.hasMany(models.Like, { foreignKey: 'postId', sourceKey: 'postId', onDelete: 'CASCADE' });
      posts.hasMany(models.Comments, { foreignKey: 'postId', sourceKey: 'postId', onDelete: 'CASCADE' });
      posts.belongsTo(models.users, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
    }
  }
  posts.init(
    {
      postId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: DataTypes.STRING,
      nickname: DataTypes.STRING,
      content: DataTypes.STRING,
      title: DataTypes.STRING,
      commentId: DataTypes.INTEGER,
      commentNum: DataTypes.INTEGER,
      likeNum: DataTypes.INTEGER,
      islike: DataTypes.BOOLEAN,
      mainAddress: DataTypes.STRING,
      subAddress: DataTypes.STRING,
      category: DataTypes.STRING,
      type: DataTypes.STRING,
      link: DataTypes.STRING,
      houseTitle: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "posts",
    }
  );
  return posts;
};
