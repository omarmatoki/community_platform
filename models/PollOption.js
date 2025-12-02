// نموذج خيارات الاستطلاع
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PollOption = sequelize.define('PollOption', {
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
    text: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'نص الخيار مطلوب'
        }
      }
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'poll_options',
    timestamps: true
  });

  return PollOption;
};
