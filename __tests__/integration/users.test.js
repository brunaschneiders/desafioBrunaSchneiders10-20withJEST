import request from 'supertest';
import app from '../../src/app';

import truncate from '../utils/truncate';

import User from '../../src/app/models/User';

describe('tests relatives to users', () => {
  beforeEach(async () => {
    await truncate();
  });

  let token;
  const userSuccess = {
    name: 'Bruna',
    type: 'Growdever',
    username: 'bruna',
    password: '1234',
  };
  const userErrorIncorrectAttributes = {
    na: 'Bruna',
    ty: 'Admin',
    usern: 'bruna',
    passwo: '1234',
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

  it('should create a user', async () => {
    expect.assertions(6);

    const user = await User.create(userSuccess);

    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('type');
    expect(user).toHaveProperty('username');
    expect(user.name).toBe('Bruna');
    expect(user.type).toBe('Growdever');
    expect(user.username).toBe('bruna');
  });

  it('should create a account', async () => {
    expect.assertions(25);

    const responseSuccess = await request(app).post('/users').send(userSuccess);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('message');
    expect(responseSuccess.body).toHaveProperty('user');
    expect(responseSuccess.body.user).toHaveProperty('uid');
    expect(responseSuccess.body.user).toHaveProperty('name');
    expect(responseSuccess.body.user).toHaveProperty('type');
    expect(responseSuccess.body.user).toHaveProperty('username');
    expect(responseSuccess.body.user).toHaveProperty('password_hash');
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.message).toBe(
      'Usuário cadastrado com sucesso!'
    );
    expect(responseSuccess.body.user.name).toBe('Bruna');
    expect(responseSuccess.body.user.type).toBe('Growdever');
    expect(responseSuccess.body.user.username).toBe('bruna');

    const responseErrorUserAlreadyExist = await request(app)
      .post('/users')
      .send(userSuccess);
    expect(responseErrorUserAlreadyExist.body).toHaveProperty('success');
    expect(responseErrorUserAlreadyExist.body).toHaveProperty('message');
    expect(responseErrorUserAlreadyExist.status).toBe(404);
    expect(responseErrorUserAlreadyExist.body.success).toBe(false);
    expect(responseErrorUserAlreadyExist.body.message).toBe(
      'Usuário já cadastrado.'
    );

    const responseErrorIncorrectAttributes = await request(app)
      .post('/users')
      .send(userErrorIncorrectAttributes);
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('success');
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('message');
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('error');
    expect(responseErrorIncorrectAttributes.status).toBe(404);
    expect(responseErrorIncorrectAttributes.body.success).toBe(false);
    expect(responseErrorIncorrectAttributes.body.message).toBe(
      'Não foi possível cadastrar o Usuário. Por favor, revise os dados e tente novamente.'
    );
  });

  it('should bring all the users from the DB', async () => {
    expect.assertions(14);

    await User.create(userSuccess);

    const responseSuccess = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);
    const responseWithoutToken = await request(app).get('/users');

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('users');
    expect(responseSuccess.body.users).toBeInstanceOf(Array);
    expect(responseSuccess.body.users[0]).toHaveProperty('uid');
    expect(responseSuccess.body.users[0]).toHaveProperty('name');
    expect(responseSuccess.body.users[0]).toHaveProperty('type');
    expect(responseSuccess.body.users[0]).toHaveProperty('username');
    expect(responseSuccess.body.users[0]).toHaveProperty('growdever');
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseWithoutToken.body).toHaveProperty('success');
    expect(responseWithoutToken.body).toHaveProperty('message');
    expect(responseWithoutToken.body.success).toBe(false);
    expect(responseWithoutToken.body.message).toBe('Token não autorizado.');
  });

  it('should bring one specific user from the DB', async () => {
    expect.assertions(17);

    const user = await User.create(userSuccess);

    const responseSuccess = await request(app)
      .get(`/users/${user.dataValues.uid}`)
      .set('Authorization', `Bearer ${token}`);
    const responseError = await request(app)
      .get(`/users/undefined`)
      .set('Authorization', `Bearer ${token}`);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('user');
    expect(responseSuccess.body.user).toHaveProperty('uid');
    expect(responseSuccess.body.user).toHaveProperty('name');
    expect(responseSuccess.body.user).toHaveProperty('type');
    expect(responseSuccess.body.user).toHaveProperty('username');
    expect(responseSuccess.body.user).toHaveProperty('growdever');
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.user.uid).toBe(user.uid);
    expect(responseError.body).toHaveProperty('success');
    expect(responseError.body).toHaveProperty('message');
    expect(responseError.body).toHaveProperty('error');
    expect(responseError.status).toBe(404);
    expect(responseError.body.success).toBe(false);
    expect(responseError.body.message).toBe(
      'Não foi possível buscar este usuário. Por favor, tente novamente.'
    );
    expect(responseError.body.error).toBe('Usuário não encontrado');
  });

  it('should update one specific user from the DB', async () => {
    expect.assertions(25);

    const user = await User.create(userSuccess);
    const anotherUser = await User.create({
      name: 'OutraBruna',
      type: 'Growdever',
      username: 'outrabruna',
      password: '1234',
    });

    const userUpdated = {
      username: 'bruna',
      oldPassword: '1234',
      password: '12345',
    };

    const userUpdatedIncorrectPassword = {
      username: 'bruna',
      oldPassword: 'xxxxx',
      password: '12345',
    };

    const responseSuccess = await request(app)
      .put(`/users/${user.dataValues.uid}`)
      .send(userUpdated)
      .set('Authorization', `Bearer ${token}`);
    const responseErrorUndefinedUid = await request(app)
      .put(`/users/undefined`)
      .send(userUpdated)
      .set('Authorization', `Bearer ${token}`);
    const responseErrorAnotherUid = await request(app)
      .put(`/users/${anotherUser.dataValues.uid}`)
      .send(userUpdated)
      .set('Authorization', `Bearer ${token}`);
    const responseErrorIncorrectPassword = await request(app)
      .put(`/users/${user.dataValues.uid}`)
      .send(userUpdatedIncorrectPassword)
      .set('Authorization', `Bearer ${token}`);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('message');
    expect(responseSuccess.body).toHaveProperty('user');
    expect(responseSuccess.body.user).toHaveProperty('uid');
    expect(responseSuccess.body.user).toHaveProperty('name');
    expect(responseSuccess.body.user).toHaveProperty('type');
    expect(responseSuccess.body.user).toHaveProperty('username');
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.message).toBe('Senha atualizada com sucesso!');
    expect(responseErrorUndefinedUid.body).toHaveProperty('success');
    expect(responseErrorUndefinedUid.body).toHaveProperty('message');
    expect(responseErrorUndefinedUid.status).toBe(404);
    expect(responseErrorUndefinedUid.body.success).toBe(false);
    expect(responseErrorUndefinedUid.body.message).toBe(
      'Usuário não encontrado.'
    );
    expect(responseErrorAnotherUid.body).toHaveProperty('success');
    expect(responseErrorAnotherUid.body).toHaveProperty('message');
    expect(responseErrorAnotherUid.status).toBe(404);
    expect(responseErrorAnotherUid.body.success).toBe(false);
    expect(responseErrorAnotherUid.body.message).toBe(
      'Usuário não encontrado.'
    );
    expect(responseErrorIncorrectPassword.body).toHaveProperty('success');
    expect(responseErrorIncorrectPassword.body).toHaveProperty('message');
    expect(responseErrorIncorrectPassword.status).toBe(404);
    expect(responseErrorIncorrectPassword.body.success).toBe(false);
    expect(responseErrorIncorrectPassword.body.message).toBe('Senha inválida.');
  });

  it('should delete one specific user from the DB', async () => {
    expect.assertions(10);

    const user = await User.create(userSuccess);

    const responseSuccess = await request(app)
      .delete(`/users/${user.dataValues.uid}`)
      .set('Authorization', `Bearer ${token}`);
    const responseErrorUndefinedUid = await request(app)
      .delete(`/users/undefined`)
      .set('Authorization', `Bearer ${token}`);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('message');
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.message).toBe('Usuário deletado com sucesso!');
    expect(responseErrorUndefinedUid.body).toHaveProperty('success');
    expect(responseErrorUndefinedUid.body).toHaveProperty('message');
    expect(responseErrorUndefinedUid.status).toBe(404);
    expect(responseErrorUndefinedUid.body.success).toBe(false);
    expect(responseErrorUndefinedUid.body.message).toBe(
      'Este usuário não foi encontrado.'
    );
  });
});
