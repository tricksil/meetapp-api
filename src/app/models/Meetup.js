import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    // meetup title , description, location, date and hour
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
        banner_id: Sequelize.INTEGER,
        user_id: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'banner_id', as: 'banner' });
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'organizer' });
    this.belongsToMany(models.User, {
      through: 'subscriptions',
      as: 'users',
      foreignKey: 'meetup_id',
    });
  }
}

export default Meetup;
