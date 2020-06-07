import { format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class SubscriptionMail {
  // job key
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, userName } = data;

    await Mail.sendMail({
      to: `${meetup.organizer.email} <${meetup.organizer.email}>`,
      subject: `Inscrição - ${meetup.title}`,
      template: 'subscription',
      context: {
        organizer: meetup.organizer.name,
        user: userName,
        date: format(new Date(), "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new SubscriptionMail();
