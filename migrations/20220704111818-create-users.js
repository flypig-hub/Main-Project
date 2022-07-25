'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      userId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      snsId: {
        type: Sequelize.STRING
      },
      nickname: {
        type: Sequelize.STRING
      },
      userImage: {
        type: Sequelize.STRING
      },
      email : {
        type: Sequelize.STRING
      },
      host: {
        type: Sequelize.BOOLEAN
      },
       createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};