import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
    async index(req, res) {
        const checkUserProvider = await User.findOne({
            where: {
                id: req.params.id,
                provider: true,
            },
        });
        
        if (!checkUserProvider) {
            return res.status(401).json({ error: 'User is not a provider' });
        }
        
        const appointments = await Appointment.findAll({
            where: {
                provider_id: req.params.id,
                canceled_at: null,
            },
            include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['name'],
                },
            ],
            order: ['data'],
        });

        return res.json(appointments);
    }
}

export default new ScheduleController();