// نموذج الألعاب
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Game = sequelize.define('Game', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('crossword', 'puzzle'),
      allowNull: false,
      validate: {
        isIn: {
          args: [['crossword', 'puzzle']],
          msg: 'نوع اللعبة يجب أن يكون crossword أو puzzle'
        }
      }
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'عنوان اللعبة مطلوب'
        }
      }
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'محتوى اللعبة بصيغة JSON - للكلمات المتقاطعة: {words: [{number, direction, question, answer, position: {row, col}}]}'
    },
    educationalMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'الرسالة التعليمية التي تظهر بعد إكمال اللعبة'
    },
    pointsReward: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'games',
    timestamps: true
  });

  return Game;
};
