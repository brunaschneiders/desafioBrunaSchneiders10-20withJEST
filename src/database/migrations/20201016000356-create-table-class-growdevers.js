module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('class_growdevers', {
      uid: {
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      growdever_uid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'growdevers',
          key: 'uid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      class_uid: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'growdev_classes',
          key: 'uid',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('class_growdevers');
  },
};
