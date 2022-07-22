const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');
const {check, validationResult} = require('express-validator');

router.use(express.json());

const validateUsername = check('username')
  .notEmpty()
  .withMessage('username_null')
  .bail()
  .isLength({min: 4, max: 32})
  .withMessage('username_size');

const validateEmail = check('email')
  .notEmpty()
  .withMessage('email_null')
  .bail()
  .isEmail()
  .withMessage('email_invalid')
  .bail()
  .custom(async (email) => {
    const user = await UserService.findByEmail(email);
    if (user) throw new Error('email_inuse');
  });

const validatePassword = check('password')
  .notEmpty()
  .withMessage('password_null')
  .bail()
  .isLength({min: 6})
  .withMessage('password_size')
  .bail()
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
  .withMessage('password_pattern');

router.post(
  '/api/1.0/users',
  validateUsername,
  validateEmail,
  validatePassword,
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors
        .array()
        .forEach(
          (error) => (validationErrors[error.param] = request.t(error.msg)),
        );

      return response.status(400).send({validationErrors: validationErrors});
    }

    try {
      await UserService.save(request.body);
      return response.send({message: 'user created'});
    } catch (err) {
      return response.status(502).send({message: request.t(err.message)});
    }
  },
);

module.exports = router;
