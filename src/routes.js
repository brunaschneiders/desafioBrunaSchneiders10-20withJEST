import { Router } from 'express';
import cors from 'cors';

import AuthController from './app/controllers/AuthController';
import UserController from './app/controllers/UserController';
import GrowdeverController from './app/controllers/GrowdeverController';
import GrowdevClassController from './app/controllers/GrowdevClassController';
import ClassGrowdeversController from './app/controllers/ClassGrowdeversController';

import authMiddleware from './app/middlewares/auth';

const routes = Router();
routes.use(cors());

routes.get('/', (req, res) => res.json({ result: 'CLASSES REGISTER API' }));

// ROUTES PARA USER
routes.post('/users', UserController.store);

// // ROUTES PARA AUTH
routes.post('/login', AuthController.store);

routes.use(authMiddleware);

// ROUTES PARA USER(auth)
routes.get('/users', UserController.index);
routes.get('/users/:uid', UserController.show);
routes.put('/users/:uid', UserController.update);
routes.delete('/users/:uid', UserController.delete);

// ROUTES PARA GROWDEVER (auth)

routes.post('/growdevers', GrowdeverController.store);
routes.get('/growdevers', GrowdeverController.index);
routes.get('/growdevers/:uid', GrowdeverController.show);
routes.put('/growdevers/:uid', GrowdeverController.update);
routes.delete('/growdevers/:uid', GrowdeverController.delete);

// ROUTES PARA CLASS (auth)

routes.post('/classes', GrowdevClassController.store);
routes.get('/classes', GrowdevClassController.index);
routes.get('/classes/:uid', GrowdevClassController.show);
routes.put('/classes/:uid', GrowdevClassController.update);
routes.delete('/classes/:uid', GrowdevClassController.delete);

// ROUTES PARA CLASSGROWDEVER (auth)

routes.post('/class-growdevers', ClassGrowdeversController.store);
routes.put('/class-growdevers/:uid', ClassGrowdeversController.update);
routes.delete('/class-growdevers/:uid', ClassGrowdeversController.delete);

export default routes;
