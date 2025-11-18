// نموذج استطلاع الجلسة الحوارية
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SessionPoll = sequelize.define('SessionPoll', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'discussion_sessions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'عنوان الاستطلاع مطلوب'
        }
      }
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'تاريخ انتهاء الاستطلاع غير صالح'
        }
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'هل الاستطلاع نشط أم انتهى'
    },
    pointsReward: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'session_polls',
    timestamps: true
  });

  return SessionPoll;
};
