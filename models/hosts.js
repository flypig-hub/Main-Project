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
      // hosts.hasMany(models.images, { foreignKey: 'hostNumber', sourceKey: 'hostId', as: 'hostId' });
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
    title: DataTypes.STRING,
    category: DataTypes.STRING,
    houstInfo: DataTypes.STRING,
    mainAddress: DataTypes.STRING,
    subAddress: DataTypes.STRING,
    stepSelect: DataTypes.STRING,
    stepInfo: DataTypes.STRING,
    link: DataTypes.STRING,
    hostContent: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'hosts',
  });
  return hosts;
};