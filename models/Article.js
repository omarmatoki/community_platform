// نموذج المقالات
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Article = sequelize.define('Article', {
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
          msg: 'عنوان المقال مطلوب'
        }
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'محتوى المقال مطلوب'
        }
      }
    },
    author: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [2, 100],
          msg: 'اسم الكاتب يجب أن يكون بين 2 و 100 حرف'
        }
      }
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: {
          args: [2, 200],
          msg: 'المصدر يجب أن يكون بين 2 و 200 حرف'
        }
      }
    },
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
    tableName: 'articles',
    timestamps: true
  });

  return Article;
};
