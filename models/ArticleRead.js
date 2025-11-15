// نموذج سجل قراءة المقالات - لمنع تكرار منح النقاط
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ArticleRead = sequelize.define('ArticleRead', {
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
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'articles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    pointsEarned: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'article_reads',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'articleId'],
        name: 'unique_user_article_read'
      }
    ]
  });

  return ArticleRead;
};
