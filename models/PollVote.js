// نموذج أصوات الاستطلاعات
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PollVote = sequelize.define('PollVote', {
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
        model: 'polls',
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
    vote: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'الصوت مطلوب'
        }
      }
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'poll_votes',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['pollId', 'userId'],
        name: 'unique_poll_user_vote'
      }
    ]
  });

  return PollVote;
};
