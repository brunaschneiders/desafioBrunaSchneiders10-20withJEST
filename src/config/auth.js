require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

export default {
  secret: process.env.PRIVATE_TOKEN,
  expiresIn: '1d',
};
