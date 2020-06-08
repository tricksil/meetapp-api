import Meetup from '../models/Meetup';
import File from '../models/File';

class OrganizedController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      attributes: ['id', 'title', 'description', 'date', 'location'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
      order: [['date', 'DESC']],
    });

    return res.json(meetups);
  }
}

export default new OrganizedController();
