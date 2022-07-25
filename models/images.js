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
      images.belongsTo(models.posts, { foreignKey: 'postId', sourceKey: 'postId', onDelete: 'CASCADE' });
      images.belongsTo(models.hosts, { foreignKey: 'hostId', sourceKey: 'hostId', onDelete: 'CASCADE' });
      images.belongsTo(models.users, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
      
    }
  }
  images.init({
    imageId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    hostId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    nickname: DataTypes.STRING,
    snsId : DataTypes.STRING,
    postId: DataTypes.INTEGER,
    thumbnailKEY: DataTypes.INTEGER,
    thumbnailURL: DataTypes.INTEGER,
    postImageKEY: DataTypes.STRING,
    postImageURL: DataTypes.STRING,
    userImageKEY: DataTypes.STRING,
    userImageURL: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'images',
  });
  return images;
};