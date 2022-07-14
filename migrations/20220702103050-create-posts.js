'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("posts", {
      postId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.STRING,
      },
      userImage: {
        type: Sequelize.STRING,
      },
      nickname: {
        type: Sequelize.STRING,
      },
      postNumber: {
        type: Sequelize.STRING,
      },
      content: {
        type: Sequelize.STRING,
      },
      title: {
        type: Sequelize.STRING,
      },
      commentId: {
        type: Sequelize.INTEGER,
      },
      commentNum: {
        type: Sequelize.INTEGER,
      },
      likeNum: {
        type: Sequelize.INTEGER,
      },
      islike: {
        type: Sequelize.INTEGER,
      },
      thumbnailKEY: {
        type: Sequelize.STRING,
      },
      thumbnailURL: {
        type: Sequelize.STRING,
      },
      postImageKEY: {
        type: Sequelize.STRING,
      },
      postImageURL: {
        type: Sequelize.STRING,
      },
      mainAddress: {
        type: Sequelize.STRING,
      },
      subAddress: {
        type: Sequelize.STRING,
      },
      category: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      link: {
        type: Sequelize.STRING,
      },
      houseTitle: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('posts');
  }
};