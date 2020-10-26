import Sequelize from 'sequelize';
import dataBaseConfig from '../config/database';
import 'dotenv/config';
import User from '../app/models/User';
import Growdever from '../app/models/Growdever';
import GrowdevClass from '../app/models/GrowdevClass';
import ClassGrowdever from '../app/models/ClassGrowdever';

const models = [User, Growdever, GrowdevClass, ClassGrowdever];

class DataBase {
  constructor() {
    this.init();
  }

  init() {
    if (process.env.NODE_ENV === 'test') {
      this.connection = new Sequelize(dataBaseConfig);
    } else {
      this.connection = new Sequelize(process.env.DATABASE_URL, dataBaseConfig);
    }

    models
      .map((model) => model.init(this.connection))
      .map(
        (model) => model.associate && model.associate(this.connection.models)
      );
  }
}

export default new DataBase();
