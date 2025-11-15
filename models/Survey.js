// نموذج الاستبيانات
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Survey = sequelize.define('Survey', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    articleId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'articles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'surveys',
    timestamps: true
  });

  return Survey;
};
