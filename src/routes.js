import { Router } from 'express';
import multer from 'multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import OrganizedController from './app/controllers/OrganizedController';
import SubscribeController from './app/controllers/SubscribeController';

import authMiddleware from './app/middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();

const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

// data validation
routes.use(authMiddleware);

routes.put('/users', UserController.update);

// meetup
routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:meetupId', MeetupController.update);
routes.delete('/meetups/:meetupId', MeetupController.delete);

// organization
routes.get('/meetups/organized', OrganizedController.index);

// subscription
routes.get('/subscribe', SubscribeController.index);
routes.post('/subscribe/:meetupId', SubscribeController.store);
routes.delete('/subscribe/:meetupId', SubscribeController.delete);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
