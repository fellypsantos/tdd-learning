const User = require('../entities/User');
const MailService = require('../services/MailService');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sequelize = require('../config/database');
const MailException = require('../services/MailException');

const generateToken = (length) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

const save = async (body) => {
  const {username, email, password} = body;
  const hash = await bcrypt.hash(password, 10);
  const user = {
    username,
    email,
    password: hash,
    activationToken: generateToken(16),
  };
  const transaction = await sequelize.transaction();
  await User.create(user, {transaction});

  try {
    await MailService.sendAccountActivation(email, user.activationToken);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw new MailException();
  }
};

const findByEmail = async (email) => {
  return await User.findOne({where: {email: email}});
};

module.exports = {
  save,
  findByEmail,
};
