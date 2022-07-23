'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class mypage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      mypage.belongsTo(models.posts, { foreignKey: 'title', sourceKey: 'title', onDelete: 'CASCADE' });
      mypage.belongsTo(models.posts, { foreignKey: 'nickname', sourceKey: 'nickname', onDelete: 'CASCADE' });
      mypage.belongsTo(models.posts, { foreignKey: 'commentNum', sourceKey: 'commentNum', onDelete: 'CASCADE' });
      mypage.belongsTo(models.posts, { foreignKey: 'likeNum', sourceKey: 'likeNum', onDelete: 'CASCADE' });
      mypage.belongsTo(models.images, { foreignKey: 'thumbnailURL', sourceKey: 'thumbnailURL', onDelete: 'CASCADE' });
    }
  }
  mypage.init({
    mypageId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    nickname: DataTypes.STRING,
    title: DataTypes.STRING,
    thumbnailURL: DataTypes.STRING,
    commentNum:DataTypes.INTEGER,
    likeNum:DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'mypage',
  });
  return mypage;
};