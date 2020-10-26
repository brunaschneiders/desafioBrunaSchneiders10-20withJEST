import request from 'supertest';
import app from '../../src/app';

import truncate from '../utils/truncate';

import User from '../../src/app/models/User';
import GrowdevClass from '../../src/app/models/GrowdevClass';

describe('tests relatives to growdev classes', () => {
  beforeEach(async () => {
    await truncate();
  });

  let adminToken;
  const classSuccess = {
    date: '2020-11-12',
    hour: '13:30',
    status: 'Aguardando',
    available_vacancies: 10,
  };
  const classErrorIncorrectAttributes = {
    da: '2020-11-12',
    ho: '13:30',
    st: 'Aguardando',
    availab: 10,
  };

  beforeAll(async (done) => {
    const adminUser = await User.create({
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
        adminToken = response.body.token;
        done();
      });
  });

  it('should create a class', async () => {
    expect.assertions(26);
    const responseSuccess = await request(app)
      .post('/classes')
      .send(classSuccess)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('message');
    expect(responseSuccess.body).toHaveProperty('growdevClass');
    expect(responseSuccess.body.growdevClass).toHaveProperty('uid');
    expect(responseSuccess.body.growdevClass).toHaveProperty('date');
    expect(responseSuccess.body.growdevClass).toHaveProperty('hour');
    expect(responseSuccess.body.growdevClass).toHaveProperty('status');
    expect(responseSuccess.body.growdevClass).toHaveProperty(
      'available_vacancies'
    );
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.message).toBe('Aula cadastrada com sucesso!');
    expect(responseSuccess.body.growdevClass.date).toBe('2020-11-12');
    expect(responseSuccess.body.growdevClass.hour).toBe('13:30');
    expect(responseSuccess.body.growdevClass.status).toBe('Aguardando');
    expect(responseSuccess.body.growdevClass.available_vacancies).toBe(10);

    const responseErrorIncorrectAttributes = await request(app)
      .post('/classes')
      .send(classErrorIncorrectAttributes)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('success');
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('message');
    expect(responseErrorIncorrectAttributes.body).toHaveProperty('error');
    expect(responseErrorIncorrectAttributes.status).toBe(404);
    expect(responseErrorIncorrectAttributes.body.success).toBe(false);
    expect(responseErrorIncorrectAttributes.body.message).toBe(
      'Não foi possível cadastrar esta aula. Por favor, revise os dados e tente novamente.'
    );

    const growdeverUser = await User.create({
      name: 'Growdever',
      type: 'Growdever',
      username: 'growdever',
      password: '1234',
    });
    const loginGrowdever = await request(app).post('/login').send({
      username: 'growdever',
      password: '1234',
    });
    const growdeverToken = loginGrowdever.body.token;
    const responseErrorUnauthorized = await request(app)
      .post('/classes')
      .send(classSuccess)
      .set('Authorization', `Bearer ${growdeverToken}`);
    expect(responseErrorUnauthorized.body).toHaveProperty('success');
    expect(responseErrorUnauthorized.body).toHaveProperty('message');
    expect(responseErrorUnauthorized.status).toBe(403);
    expect(responseErrorUnauthorized.body.success).toBe(false);
    expect(responseErrorUnauthorized.body.message).toBe('Acesso Negado.');
  });

  it('should bring all the classes from the DB', async () => {
    expect.assertions(14);

    await GrowdevClass.create(classSuccess);

    const responseSuccess = await request(app)
      .get('/classes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('classes');
    expect(responseSuccess.body.classes).toBeInstanceOf(Array);
    expect(responseSuccess.body.classes[0]).toHaveProperty('uid');
    expect(responseSuccess.body.classes[0]).toHaveProperty('date');
    expect(responseSuccess.body.classes[0]).toHaveProperty('hour');
    expect(responseSuccess.body.classes[0]).toHaveProperty('status');
    expect(responseSuccess.body.classes[0]).toHaveProperty(
      'available_vacancies'
    );
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);

    const responseWithoutToken = await request(app).get('/classes');

    expect(responseWithoutToken.body).toHaveProperty('success');
    expect(responseWithoutToken.body).toHaveProperty('message');
    expect(responseWithoutToken.body.success).toBe(false);
    expect(responseWithoutToken.body.message).toBe('Token não autorizado.');
  });

  it('should bring one specific class from the DB', async () => {
    expect.assertions(17);

    const growdevClass = await GrowdevClass.create(classSuccess);

    const responseSuccess = await request(app)
      .get(`/classes/${growdevClass.dataValues.uid}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('growdevClass');
    expect(responseSuccess.body.growdevClass).toHaveProperty('uid');
    expect(responseSuccess.body.growdevClass).toHaveProperty('date');
    expect(responseSuccess.body.growdevClass).toHaveProperty('hour');
    expect(responseSuccess.body.growdevClass).toHaveProperty('status');
    expect(responseSuccess.body.growdevClass).toHaveProperty(
      'available_vacancies'
    );
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.growdevClass.uid).toBe(growdevClass.uid);

    const responseError = await request(app)
      .get(`/classes/undefined`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(responseError.body).toHaveProperty('success');
    expect(responseError.body).toHaveProperty('message');
    expect(responseError.body).toHaveProperty('error');
    expect(responseError.status).toBe(404);
    expect(responseError.body.success).toBe(false);
    expect(responseError.body.message).toBe(
      'Não foi possível buscar esta aula. Por favor, tente novamente.'
    );
    expect(responseError.body.error).toBe('Aula não encontrada');
  });

  it('should update one specific class from the DB', async () => {
    expect.assertions(11);

    const growdevClass = await GrowdevClass.create(classSuccess);

    const classUpdated = {
      date: '2020-11-12',
      hour: '13:30',
      status: 'Realizada',
      available_vacancies: 10,
    };

    const responseSuccess = await request(app)
      .put(`/classes/${growdevClass.dataValues.uid}`)
      .send(classUpdated)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('message');
    expect(responseSuccess.body).toHaveProperty('growdevClass');
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.message).toBe('Dados atualizados com sucesso!');

    const responseErrorUndefinedUid = await request(app)
      .put(`/classes/undefined`)
      .send(classUpdated)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(responseErrorUndefinedUid.body).toHaveProperty('success');
    expect(responseErrorUndefinedUid.body).toHaveProperty('message');
    expect(responseErrorUndefinedUid.status).toBe(404);
    expect(responseErrorUndefinedUid.body.success).toBe(false);
    expect(responseErrorUndefinedUid.body.message).toBe(
      'Esta aula não foi encontrada.'
    );
  });

  it('should delete one specific class from the DB', async () => {
    expect.assertions(10);

    const growdevClass = await GrowdevClass.create(classSuccess);

    const responseSuccess = await request(app)
      .delete(`/classes/${growdevClass.dataValues.uid}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(responseSuccess.body).toHaveProperty('success');
    expect(responseSuccess.body).toHaveProperty('message');
    expect(responseSuccess.status).toBe(200);
    expect(responseSuccess.body.success).toBe(true);
    expect(responseSuccess.body.message).toBe('Aula cancelada com sucesso!');

    const responseErrorUndefinedUid = await request(app)
      .delete(`/classes/undefined`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(responseErrorUndefinedUid.body).toHaveProperty('success');
    expect(responseErrorUndefinedUid.body).toHaveProperty('message');
    expect(responseErrorUndefinedUid.status).toBe(404);
    expect(responseErrorUndefinedUid.body.success).toBe(false);
    expect(responseErrorUndefinedUid.body.message).toBe(
      'Esta aula não foi encontrada.'
    );
  });
});
