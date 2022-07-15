const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');
const {check, validationResult} = require('express-validator');

router.use(express.json());

const validateUsername = check('username')
  .notEmpty()
  .withMessage('Username cannot be null')
  .bail()
  .isLength({min: 4, max: 32})
  .withMessage('Must have min 4 and max 32 characters');

const validateEmail = check('email')
  .notEmpty()
  .withMessage('E-mail cannot be null')
  .bail()
  .isEmail()
  .withMessage('E-mail is not valid')
  .bail()
  .custom(async (email) => {
    const user = await UserService.findByEmail(email);
    if (user) throw new Error('E-mail in use');
  });

const validatePassword = check('password')
  .notEmpty()
  .withMessage('Password cannot be null')
  .bail()
  .isLength({min: 6})
  .withMessage('Password must be at least 6 characters')
  .bail()
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
  .withMessage(
    'Password must have at least 1 uppercase, 1 lowercase and 1 number',
  );

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
        .forEach((error) => (validationErrors[error.param] = error.msg));

      return response.status(400).send({validationErrors: validationErrors});
    }

    await UserService.save(request.body);
    return response.send({message: 'user created'});
  },
);

module.exports = router;
