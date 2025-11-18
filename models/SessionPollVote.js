// نموذج أصوات استطلاع الجلسة
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SessionPollVote = sequelize.define('SessionPollVote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    pollId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'session_polls',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    optionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'session_poll_options',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'session_poll_votes',
    timestamps: true
  });

  return SessionPollVote;
};
