'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('images', {
      imageId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      postNumber : {
        type: Sequelize.STRING
      },
      postImageKEY: {
        type: Sequelize.STRING
      },
      postImageURL: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('images');
  }
};