import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizedController {
  async index(req, res) {
    const meetup = await Meetup.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['name', 'path', 'url'],
        },
      ],
      order: [['date', 'DESC']],
    });

    return res.json(meetup);
  }
}

export default new OrganizedController();
