// نموذج حضور الجلسات
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SessionAttendance = sequelize.define('SessionAttendance', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    attended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'session_attendance',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['sessionId', 'userId'],
        name: 'unique_session_user_attendance'
      }
    ]
  });

  return SessionAttendance;
};
