const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/entities/User');
const sequelize = require('../src/config/database');

beforeAll(() => sequelize.sync());

beforeEach(() => User.destroy({truncate: true}));

describe('User Registration', () => {
  const postValidUser = () =>
    request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@mail.com',
      password: '1234',
    });

  it('should return 200 OK when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.status).toBe(200);
  });

  it('should return success message when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.body.message).toBe('user created');
  });

  it('should add an user to database', async () => {
    await postValidUser();
    const users = await User.findAll();
    expect(users.length).toBe(1);
  });

  it('should have an email and password', async () => {
    await postValidUser();
    const users = await User.findAll();
    const newUser = users[0];
    expect(newUser.username).toBe('user1');
    expect(newUser.email).toBe('user1@mail.com');
  });

  it('should have a hashed password', async () => {
    await postValidUser();
    const users = await User.findAll();
    const user = users[0];
    expect(user.password).not.toBe('1234');
  });
});
