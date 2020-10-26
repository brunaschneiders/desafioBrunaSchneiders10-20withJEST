import request from 'supertest';
import app from '../../src/app';

import truncate from '../utils/truncate';

import User from '../../src/app/models/User';

describe('tests relatives to auth', () => {
  beforeEach(async () => {
    await truncate();
  });

  let token;
  const userSuccess = {
    name: 'Usuário',
    type: 'Growdever',
    username: 'usuario',
    password: '1234',
  };

  beforeAll(async (done) => {
    const userAdmin = await User.create({
      name: 'Admin',
      type: 'Admin',
      username: 'admin',
      password: '1234',
    });
    request(app)
      .post('/login')
      .send({
        username: 'admin',
        password: '1234',
      })
      .end((err, response) => {
        token = response.body.token;
        done();
      });
  });

  it('should login a user', async () => {
    expect.assertions(29);

    await User.create(userSuccess);
    const responseSuccess = await request(app).post('/login').send({
      username: 'usuario',
      password: '1234',
    });
    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('user');
    expect(responseSuccess.body.user).toHaveProperty('uid');
    expect(responseSuccess.body.user).toHaveProperty('name');
    expect(responseSuccess.body.user).toHaveProperty('type');
    expect(responseSuccess.body.user).toHaveProperty('username');
    expect(responseSuccess.body.user).toHaveProperty('growdever');
    expect(responseSuccess.body).toHaveProperty('token');
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.user.name).toBe('Usuário');
    expect(responseSuccess.body.user.type).toBe('Growdever');
    expect(responseSuccess.body.user.username).toBe('usuario');

    await User.create(userSuccess);
    const responseErrorIncorrectUsername = await request(app)
      .post('/login')
      .send({
        username: 'xxxx',
        password: '1234',
      });
    expect(responseErrorIncorrectUsername.body).toHaveProperty('success');
    expect(responseErrorIncorrectUsername.body).toHaveProperty('message');
    expect(responseErrorIncorrectUsername.status).toBe(404);
    expect(responseErrorIncorrectUsername.body.success).toBe(false);
    expect(responseErrorIncorrectUsername.body.message).toBe(
      'Usuário não encontrado.'
    );

    await User.create(userSuccess);
    const responseErrorIncorrectPassword = await request(app)
      .post('/login')
      .send({
        username: 'usuario',
        password: '12x34',
      });
    expect(responseErrorIncorrectPassword.body).toHaveProperty('success');
    expect(responseErrorIncorrectPassword.body).toHaveProperty('message');
    expect(responseErrorIncorrectPassword.status).toBe(404);
    expect(responseErrorIncorrectPassword.body.success).toBe(false);
    expect(responseErrorIncorrectPassword.body.message).toBe('Senha inválida.');

    const responseErrorIncorrectAttributes = await request(app)
      .post('/login')
      .send({
        user: 'xxxx',
        pas: '1234',
      });
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('success');
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('message');
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('error');
    expect(responseErrorIncorrectAttributes.status).toBe(404);
    expect(responseErrorIncorrectAttributes.body.success).toBe(false);
    expect(responseErrorIncorrectAttributes.body.message).toBe(
      'Não foi possível realizar o login. Por favor, tente novamente.'
    );
  });
});
