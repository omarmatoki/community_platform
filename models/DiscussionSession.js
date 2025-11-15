// نموذج الجلسات الحوارية
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DiscussionSession = sequelize.define('DiscussionSession', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'عنوان الجلسة مطلوب'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    meetLink: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: {
          msg: 'رابط Google Meet غير صالح'
        }
      }
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: {
          msg: 'تاريخ الجلسة غير صالح'
        }
      }
    },
    pointsReward: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      validate: {
        min: 0
      }
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    }
  }, {
    tableName: 'discussion_sessions',
    timestamps: true
  });

  return DiscussionSession;
};
