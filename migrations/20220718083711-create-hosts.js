'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('hosts', {
      hostId: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      imageId : {
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      category: {
        type: Sequelize.STRING
      },
      houstInfo: {
        type: Sequelize.STRING
      },
      mainAddress: {
        type: Sequelize.STRING
      },
      subAddress: {
        type: Sequelize.STRING
      },
      stepSelect: {
        type: Sequelize.STRING
      },
      stepInfo: {
        type: Sequelize.STRING
      },
      link: {
        type: Sequelize.STRING
      },
      hostContent: {
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
    await queryInterface.dropTable('hosts');
  }
};