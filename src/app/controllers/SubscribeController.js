import { isBefore } from 'date-fns';
import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import Queue from '../../lib/Queue';
import SubscriptionMail from '../jobs/SubscriptionMail';

class SubscribeController {
  async index(req, res) {
    const meetup = await Meetup.findAll({
      where: {
        date: {
          [Op.gt]: new Date(),
        },
      },
      order: ['date'],
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: User,
          as: 'users',
          where: {
            id: req.userId,
          },
          attributes: [],
        },
      ],
    });

    return res.json(meetup);
  }

  async store(req, res) {
    const { meetupId } = req.params;
    const { userId } = req;
    const meetup = await Meetup.findByPk(meetupId, {
      include: [
        {
          model: User,
          as: 'organizer',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email'],
    });

    if (meetup.user_id === user.id) {
      return res
        .status(401)
        .json({ error: "You can't subscribe at meetups that you organize" });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(401).json({
        error: "You can't subscribe at meetups that have already happened",
      });
    }

    const checkUserSubscribedMeetup = await Meetup.findOne({
      where: {
        id: meetup.id,
      },
      include: [
        {
          model: User,
          as: 'users',
          where: { id: user.id },
        },
      ],
    });

    if (checkUserSubscribedMeetup)
      return res.status(401).json({
        error: "You can't subscribe for the same meetup twice",
      });

    const checkMeetupDate = await Meetup.findOne({
      where: {
        date: meetup.date,
      },
      include: [
        {
          model: User,
          as: 'users',
          where: { id: user.id },
        },
      ],
    });

    if (checkMeetupDate)
      return res.status(401).json({
        error:
          "You can't subscribe at two meetups that happen at the same time",
      });

    meetup.addUsers(user);

    await meetup.save();

    await Queue.add(SubscriptionMail.key, {
      meetup,
      userName: user.name,
    });

    return res.json(meetup);
  }
}

export default new SubscribeController();
