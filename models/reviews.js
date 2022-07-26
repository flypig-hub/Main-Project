'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class reviews extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    
    reviews.hasMany(models.images, { foreignKey: 'reviewId', sourceKey: 'reviewId', onDelete: 'CASCADE' });
    reviews.belongsTo(models.hosts, { foreignKey: 'hostId', sourceKey: 'hostId', onDelete: 'CASCADE' });    
    reviews.belongsTo(models.users, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });    
    }
  }
  reviews.init({
    reviewId : {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    userId: DataTypes.INTEGER,
    hostId: DataTypes.INTEGER,
    nickname: DataTypes.STRING,
    review: DataTypes.STRING,
    starpoint: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'reviews',
  });
  return reviews;
};

