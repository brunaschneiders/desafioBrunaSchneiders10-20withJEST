require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

module.exports = {
  url: process.env.DATABASE_URL,
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
  },
  dialect: process.env.DB_DIALECT,
  storage: '__tests__/database.sqlite',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};
