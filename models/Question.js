// نموذج الأسئلة
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    surveyId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'surveys',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    questionText: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'نص السؤال مطلوب'
        }
      }
    }
  }, {
    tableName: 'questions',
    timestamps: true
  });

  return Question;
};
