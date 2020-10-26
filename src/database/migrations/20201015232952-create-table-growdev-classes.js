module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('growdev_classes', {
      uid: {
        allowNull: false,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      date: {
        allowNull: false,
        type: Sequelize.DATEONLY,
      },
      hour: {
        allowNull: false,
        type: Sequelize.TIME,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      available_vacancies: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('growdev_classes');
  },
};
