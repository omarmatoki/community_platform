// نموذج OTP للتحقق من رقم الهاتف
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OTP = sequelize.define('OTP', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'رقم الهاتف مطلوب'
        }
      }
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 6],
          msg: 'رمز التحقق يجب أن يكون 6 أرقام'
        }
      }
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5
      }
    }
  }, {
    tableName: 'otps',
    timestamps: true
  });

  // دالة للتحقق من صلاحية OTP
  OTP.prototype.isValid = function() {
    return !this.verified && this.expiresAt > new Date() && this.attempts < 5;
  };

  // دالة للتحقق من الرمز
  OTP.prototype.verifyCode = function(inputCode) {
    this.attempts += 1;
    if (this.code === inputCode && this.isValid()) {
      this.verified = true;
      return true;
    }
    return false;
  };

  return OTP;
};
