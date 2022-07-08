'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('posts', {
      postId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      content: {
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
      thumbnailString: {
        type: Sequelize.STRING
      },
      thumbnailKEY: {
        type: Sequelize.STRING
      },
      thumbnailURL: {
        type: Sequelize.STRING
      },
      postImageString: {
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
    await queryInterface.dropTable('posts');
  }
};