require('dotenv').config();

module.exports = {
  development: {
    logging: console.log
  },
  test: {
    logging: false
  },
  production: {
    logging: false
  }
};
