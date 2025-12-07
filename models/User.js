// نموذج المستخدمين
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'الاسم مطلوب'
        },
        len: {
          args: [2, 100],
          msg: 'الاسم يجب أن يكون بين 2 و 100 حرف'
        }
      }
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        args: true,
        msg: 'رقم الهاتف مستخدم بالفعل'
      },
      validate: {
        notEmpty: {
          msg: 'رقم الهاتف مطلوب'
        },
        is: {
          args: /^\+?[1-9]\d{1,14}$/,
          msg: 'رقم الهاتف غير صالح (يجب أن يكون بالصيغة الدولية مثل +963998107722)'
        }
      }
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'كلمة المرور مطلوبة'
        },
        len: {
          args: [6, 100],
          msg: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
        }
      }
    },
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      defaultValue: 'user',
      allowNull: false
    }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      // تشفير كلمة المرور قبل الحفظ
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // دالة للتحقق من كلمة المرور
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  // إخفاء كلمة المرور عند إرجاع البيانات
  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    return values;
  };

  return User;
};
