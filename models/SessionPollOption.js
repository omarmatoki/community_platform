// نموذج خيارات استطلاع الجلسة
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SessionPollOption = sequelize.define('SessionPollOption', {
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
    optionText: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'نص الخيار مطلوب'
        }
      }
    },
    voteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'session_poll_options',
    timestamps: true
  });

  return SessionPollOption;
};
