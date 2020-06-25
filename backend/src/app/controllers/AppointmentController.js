import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

class AppointmentController {
    async index(req, res) {
        const appointments = await Appointment.findAll({
            where: {
                user_id: req.params.id,
                canceled_at: null,
            },
            order: ['data'],
            attributes: ['id', 'data', 'past', 'cancelable'],
            include: [ 
                {
                    model: User,
                    as: 'provider',
                    attributes: ['id', 'name'],
                    include: [
                        {
                            model: File,
                            as: 'avatar',
                            attributes: ['id', 'path', 'url'],
                        },
                    ],
                },
            ],
        });
        return res.json(appointments);
    }
    
    async store(req, res) {
        const schema = Yup.object().shape({
            provider_id: Yup.number().required(),
            data: Yup.date().required()
        });
        
        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({
                error: 'Valiation fails',
            });
        }
        
        const { provider_id, data } = req.body;
        
        /**
        * Provider can't create appointment for itself
        */
        if (provider_id === req.userId) {
            return res
            .status(401)
            .json({ error: 'You can not create appointments for yourself' });
        }
        
        /**
        * Check if provider is a provider
        */
        const isProvider = await User.findOne({
            where: {
                id: provider_id,
                provider: true,
            },
        });
        
        if (!isProvider) {
            return res
            .status(401)
            .json({ error: 'You can only create appointments with providers' });
        }
        
        const hourStart = startOfHour(parseISO(data));
        /**
        * Check for past dates
        */
        if (isBefore(hourStart, new Date())) {
            return res.status(400).json({ error: 'Past date are not permitted' });
        }      
        
        /**
        * Check date availabity
        */
        const checkAvailabitity = await Appointment.findOne({
            where: {
                provider_id,
                canceled_at: null,
                data: hourStart,
            },
        });
        
        if (checkAvailabitity) {
            return res
            .status(400)
            .json({ error: 'Appointment date is not available' });
        }
        
        const appointment = await Appointment.create({
            user_id: req.userId,
            provider_id,
            data
        });
        
        /**
        * Notify appointment provider
        */
        const user = await User.findByPk(req.userId);
        const formattedDate = format(
            hourStart,
            "'dia' dd 'de' MMMM', às' H:mm'h'",
            {
                locale: pt,
            }
            );
            
            const notification = await Notification.create({
                content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
                user: provider_id,
            });
            
            console.log(notification);
            
            return res.json(appointment);
            
        }
    }
    
    export default new AppointmentController();