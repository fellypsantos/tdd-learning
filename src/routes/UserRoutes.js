const express = require('express');
const router = express.Router();
const UserService = require('../services/UserService');

router.use(express.json());

router.post('/api/1.0/users', async (request, response) => {
  await UserService.save(request.body);
  return response.send({message: 'user created'});
});

module.exports = router;
