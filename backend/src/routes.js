const { Router } = require("express");
import multer from  'multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import ProviderController from './app/controllers/ProviderController';
import FileController from './app/controllers/FileController';
import AppointmentController from './app/controllers/AppointmentController';
import ScheduleController from './app/controllers/ScheduleController';
import NotificationController from './app/controllers/NotificationController';
import AvailableController from './app/controllers/AvailableController';



import authMiddleware from './app/middleware/auth';
import multerConfig from './config/multer';


const routes = new Router();
const upload =  multer(multerConfig);


routes.get("/", (req, res) => {
    return res.json({ message: "Hello World" });
});

routes.post('/users', UserController.store);

routes.post('/files', upload.single('file'), FileController.store);

routes.get('/providers', ProviderController.index);

routes.get('/appointments/:id', AppointmentController.index);


routes.post('/sessions', SessionController.store);

// Todas as rotas que forem chamadas a partir daqui tem que ser autenticada
routes.use(authMiddleware);
routes.put('/users', UserController.update);

routes.get('/schedule/:id', ScheduleController.index);

routes.post('/appointments', AppointmentController.store);

routes.get('/notifications', NotificationController.index);
routes.put('/notifications/:id', NotificationController.update);

routes.get('/providers/:providerId/available', AvailableController.index);





export default routes;

module.exports = routes;