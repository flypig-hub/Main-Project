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
      posts.hasMany(models.images, { foreignKey: 'postId', sourceKey: 'postId', onDelete: 'CASCADE' });
      posts.hasMany(models.Like, { foreignKey: 'postId', sourceKey: 'postId', onDelete: 'CASCADE' });
      posts.hasMany(models.Comments, { foreignKey: 'postId', sourceKey: 'postId', onDelete: 'CASCADE' });
      //마이페이지
      posts.hasMany(models.mypage, { foreignKey: 'title', sourceKey: 'title', onDelete: 'CASCADE' });
      posts.hasMany(models.mypage, { foreignKey: 'nickname', sourceKey: 'nickname', onDelete: 'CASCADE' });
      posts.hasMany(models.mypage, { foreignKey: 'likeNum', sourceKey: 'likeNum', onDelete: 'CASCADE' });
      posts.hasMany(models.mypage, { foreignKey: 'commentNum', sourceKey: 'commentNum', onDelete: 'CASCADE' });
      //유저
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
      userId: DataTypes.INTEGER,
      nickname: DataTypes.STRING,
      userImage: DataTypes.STRING,
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
      tagList: DataTypes.STRING
    },
    {
      sequelize,
      modelName: "posts",
    }
  );
  return posts;
};
