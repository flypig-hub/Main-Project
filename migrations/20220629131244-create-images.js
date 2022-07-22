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
      userId : {
        type: Sequelize.STRING
      },
      userImage: {
        type: Sequelize.STRING
      },
      nickname : {
        type: Sequelize.STRING
      },
      snsId : {
        type: Sequelize.STRING
      },
      postId : {
        type: Sequelize.INTEGER
      },
      postNumber : {
        type: Sequelize.STRING
      },
      thumbnailKEY: {
        type: Sequelize.STRING
      },
      thumbnailURL: {
        type: Sequelize.STRING
      },
      postImageKEY: {
        type: Sequelize.STRING
      },
      postImageURL: {
        type: Sequelize.STRING
      },
      userImageKEY: {
        type: Sequelize.STRING
      },
      userImageURL : {
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