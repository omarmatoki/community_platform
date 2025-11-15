// نموذج إجابات المستخدمين
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserAnswer = sequelize.define('UserAnswer', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
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
    questionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'questions',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    optionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'options',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'user_answers',
    timestamps: true
  });

  return UserAnswer;
};
