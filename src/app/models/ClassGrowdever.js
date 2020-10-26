import Sequelize, { Model } from 'sequelize';

class ClassGrowdever extends Model {
  static init(sequelize) {
    super.init(
      {
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
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Growdever, {
      as: 'growdever',
      foreignKey: 'growdever_uid',
    });
    this.belongsTo(models.GrowdevClass, {
      as: 'class',
      foreignKey: 'class_uid',
    });
  }
}

export default ClassGrowdever;
