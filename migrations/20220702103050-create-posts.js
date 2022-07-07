'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      postId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      userId: {
        type: Sequelize.STRING
      },
      postContent: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      tripLocation: {
        type: Sequelize.STRING 
      },
      commentId: {
        type: Sequelize.INTEGER
      },
      commentNum: {
        type: Sequelize.INTEGER
      },
      likeNum: {
        type: Sequelize.INTEGER
      },
      thumbnailKEY: {
        type: Sequelize.STRING
      },
      thumbnailURL: {
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
    await queryInterface.dropTable('posts');
  }
};