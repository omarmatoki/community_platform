// نموذج استطلاعات الرأي
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Poll = sequelize.define('Poll', {
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
          msg: 'عنوان الاستطلاع مطلوب'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    pointsReward: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'polls',
    timestamps: true
  });

  return Poll;
};
