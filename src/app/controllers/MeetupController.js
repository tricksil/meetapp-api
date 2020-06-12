import * as Yup from 'yup';
import {
  isBefore,
  startOfHour,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns';
import { Op } from 'sequelize';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const { date, page = 1 } = req.query;

    const meetup = await Meetup.findAll({
      where: {
        date: {
          [Op.between]: [startOfDay(parseISO(date)), endOfDay(parseISO(date))],
        },
      },
      order: ['date'],
      limit: 10,
      offset: (page - 1) * 10,
      attributes: ['id', 'title', 'description', 'date', 'location'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json(meetup);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { title, description, location, date, banner_id } = req.body;

    /* 
      Check for past dates
    */

    const parseDate = startOfHour(parseISO(date));

    if (isBefore(parseDate, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date: req.body.date,
      banner_id,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const meetup = await Meetup.findByPk(req.params.meetupId);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res.status(401).json({
        error: 'You can only update the meetups in which you organize',
      });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({
        error: 'You can only update meetups that have not yet happened',
      });
    }

    if (req.body.date) {
      const parseDate = startOfHour(parseISO(req.body.date));

      if (isBefore(parseDate, new Date())) {
        return res.status(401).json({ error: 'Past dates are not permitted' });
      }
    }

    await meetup.update(req.body);

    const {
      title,
      description,
      location,
      date,
      banner,
    } = await Meetup.findByPk(req.params.meetupId, {
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    return res.json({
      title,
      description,
      location,
      date,
      banner,
    });
  }

  async delete(req, res) {
    const { meetupId } = req.params;

    const meetup = await Meetup.findByPk(meetupId);

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel meetups that not yet happened',
      });
    }

    await meetup.destroy(meetupId);

    return res.status(200).json();
  }
}

export default new MeetupController();
