'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class hosts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      hosts.hasMany(models.images, { foreignKey: 'hostId', sourceKey: 'hostId', onDelete: 'CASCADE' });
      hosts.hasMany(models.hostcomments, { foreignKey: 'hostId', sourceKey: 'hostId', onDelete: 'CASCADE' });
      hosts.hasMany(models.saves, { foreignKey: 'hostId', sourceKey: 'hostId', onDelete: 'CASCADE' });
      //유저
      hosts.belongsTo(models.users, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
    }
  }
  hosts.init({
    hostId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: DataTypes.INTEGER,
    reviewId : DataTypes.INTEGER,
    title: DataTypes.STRING,
    nickname: DataTypes.STRING,
    category: DataTypes.STRING,
    houseInfo: DataTypes.STRING,
    mainAddress: DataTypes.STRING,
    subAddress: DataTypes.STRING,
    stepSelect: DataTypes.STRING,
    stepInfo: DataTypes.STRING,
    link: DataTypes.STRING,
    hostContent: DataTypes.STRING,
    preImages: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'hosts',
  });
  return hosts;
};