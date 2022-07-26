'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      users.hasMany(models.posts, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
      users.hasMany(models.Like, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
      users.hasMany(models.images, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
      users.hasMany(models.saves, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
      users.hasMany(models.hosts, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
      users.hasMany(models.reviews, { foreignKey: 'userId', sourceKey: 'userId', onDelete: 'CASCADE' });
      users.hasMany(models.images, { foreignKey: 'userImageURL', sourceKey: 'userImageURL', onDelete: 'CASCADE' });
      
    }
  }
  users.init({
    userId: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    snsId: DataTypes.STRING,
    nickname: DataTypes.STRING,
    userImageURL: DataTypes.STRING,
    email:DataTypes.STRING,
    host:DataTypes.BOOLEAN,
    
    }, {
    sequelize,
    modelName: 'users',
  });
  return users;
};