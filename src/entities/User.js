const Sequelize = require('sequelize');
const sequelize = require('../config/database');

class User extends Sequelize.Model {}

const columns = {
  username: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
    unique: true,
  },
  password: {
    type: Sequelize.STRING,
  },
};

User.init(columns, {
  sequelize,
  modelName: 'user',
});

module.exports = User;
