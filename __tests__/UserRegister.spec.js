const request = require('supertest');
const app = require('../src/app.js');
const User = require('../src/entities/User');
const sequelize = require('../src/config/database');

beforeAll(() => sequelize.sync());

beforeEach(() => User.destroy({truncate: true}));

const validUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword',
};

const postUser = (user = validUser) =>
  request(app).post('/api/1.0/users').send(user);

describe('User Registration', () => {
  it('should return 200 OK when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('should return success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('user created');
  });

  it('should add an user to database', async () => {
    await postUser();
    const users = await User.findAll();
    expect(users.length).toBe(1);
  });

  it('should have an email and password', async () => {
    await postUser();
    const users = await User.findAll();
    const newUser = users[0];
    expect(newUser.username).toBe('user1');
    expect(newUser.email).toBe('user1@mail.com');
  });

  it('should have a hashed password', async () => {
    await postUser();
    const users = await User.findAll();
    const user = users[0];
    expect(user.password).not.toBe('p4ssword');
  });

  it('should return 400 when username is null', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'p4ssword',
    });

    expect(response.status).toBe(400);
  });

  it('should return validationErrors in response body when validation error occurs', async () => {
    const response = await postUser({
      username: null,
      email: 'user1@mail.com',
      password: 'p4ssword',
    });

    const body = response.body;
    expect(body.validationErrors).not.toBeUndefined();
  });

  const messages = {
    username_null: 'Username cannot be null',
    username_size: 'Must have min 4 and max 32 characters',
    email_null: 'E-mail cannot be null',
    email_invalid: 'E-mail is not valid',
    password_null: 'Password cannot be null',
    password_size: 'Password must be at least 6 characters',
    password_pattern:
      'Password must have at least 1 uppercase, 1 lowercase and 1 number',
    email_inuse: 'E-mail in us',
  };

  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${messages.username_null}
    ${'username'} | ${'usr'}           | ${messages.username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${messages.username_size}
    ${'email'}    | ${null}            | ${messages.email_null}
    ${'email'}    | ${'mail.com'}      | ${messages.email_invalid}
    ${'email'}    | ${'user.mail.com'} | ${messages.email_invalid}
    ${'email'}    | ${'user@mail'}     | ${messages.email_invalid}
    ${'password'} | ${null}            | ${messages.password_null}
    ${'password'} | ${'P4ssw'}         | ${messages.password_size}
    ${'password'} | ${'alllowercase'}  | ${messages.password_pattern}
    ${'password'} | ${'ALLUPPERCASE'}  | ${messages.password_pattern}
    ${'password'} | ${'123456789'}     | ${messages.password_pattern}
    ${'password'} | ${'lowerandUPPER'} | ${messages.password_pattern}
    ${'password'} | ${'lowerand11234'} | ${messages.password_pattern}
    ${'password'} | ${'UPPER4444'}     | ${messages.password_pattern}
  `(
    'should return $expectedMessage when $field is $value',
    async ({field, value, expectedMessage}) => {
      const user = {
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
      };

      user[field] = value;
      const response = await postUser(user);
      const body = response.body;
      expect(body.validationErrors[field]).toBe(expectedMessage);
    },
  );

  it('should return E-mail in use when email is already taken', async () => {
    await User.create({...validUser});
    const response = await postUser();
    const body = response.body;

    expect(body.validationErrors.email).toBe('E-mail in use');
  });

  it('should return errors for both when username and email if is null', async () => {
    const response = await postUser({
      username: null,
      email: null,
      password: 'P4ssword',
    });

    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });

  it('should return errors for both username when null, and email is in use', async () => {
    await User.create({...validUser});
    const response = await postUser({
      username: null,
      email: validUser.email,
      password: 'P4ssword',
    });

    const body = response.body;
    expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
  });
});

describe('Internationalization', () => {
  const postUser = (user = validUser) =>
    request(app).post('/api/1.0/users').set('Accept-Language', 'pt').send(user);

  const messages = {
    username_null: 'Usuário não pode ficar vazio',
    username_size: 'Precisa ter no mínimo 4 e máximo 32 caracteres',
    email_null: 'E-mail não pode ficar vazio',
    email_invalid: 'E-mail não é válido',
    password_null: 'Senha não pode ser vazia',
    password_size: 'Senha precisa ter pelo menos 6 caracteres',
    password_pattern:
      'Senha precisa ter pelo menos 1 letra maiúscula, 1 minúscula e 1 número',
    email_inuse: 'E-mail já está em uso',
  };

  it.each`
    field         | value              | expectedMessage
    ${'username'} | ${null}            | ${messages.username_null}
    ${'username'} | ${'usr'}           | ${messages.username_size}
    ${'username'} | ${'a'.repeat(33)}  | ${messages.username_size}
    ${'email'}    | ${null}            | ${messages.email_null}
    ${'email'}    | ${'mail.com'}      | ${messages.email_invalid}
    ${'email'}    | ${'user.mail.com'} | ${messages.email_invalid}
    ${'email'}    | ${'user@mail'}     | ${messages.email_invalid}
    ${'password'} | ${null}            | ${messages.password_null}
    ${'password'} | ${'P4ssw'}         | ${messages.password_size}
    ${'password'} | ${'alllowercase'}  | ${messages.password_pattern}
    ${'password'} | ${'ALLUPPERCASE'}  | ${messages.password_pattern}
    ${'password'} | ${'123456789'}     | ${messages.password_pattern}
    ${'password'} | ${'lowerandUPPER'} | ${messages.password_pattern}
    ${'password'} | ${'lowerand11234'} | ${messages.password_pattern}
    ${'password'} | ${'UPPER4444'}     | ${messages.password_pattern}
  `(
    'should return $expectedMessage when $field is $value when language is portuguese',
    async ({field, value, expectedMessage}) => {
      const user = {
        username: 'user1',
        email: 'user1@mail.com',
        password: 'P4ssword',
      };

      user[field] = value;
      const response = await postUser(user);
      const body = response.body;
      expect(body.validationErrors[field]).toBe(expectedMessage);
    },
  );

  it(`should return ${messages.email_inuse} when email is already taken and when language is portuguese`, async () => {
    await User.create({...validUser});
    const response = await postUser();
    const body = response.body;

    expect(body.validationErrors.email).toBe(messages.email_inuse);
  });
});
