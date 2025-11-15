// نموذج خيارات الإجابة
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Option = sequelize.define('Option', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'questions',
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
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  }, {
    tableName: 'options',
    timestamps: true
  });

  return Option;
};
