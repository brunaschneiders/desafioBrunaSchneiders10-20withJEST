import Sequelize, { Model } from 'sequelize';

class GrowdevClass extends Model {
  static init(sequelize) {
    super.init(
      {
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
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.hasMany(models.ClassGrowdever, {
      as: 'scheduled_class',
      foreignKey: 'class_uid',
    });
  }
}

export default GrowdevClass;
