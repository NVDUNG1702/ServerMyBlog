const { where } = require("sequelize");
const { User } = require("../../models/index");

const checkUnique = async (req, res, next) => {
    try {
      const { email } = req.body;
  
      const existingUser = await User.findOne({ where: { email } });
  
      if (existingUser) {
        return res.status(409).json({
          error: 'Email đã tồn tại'
        });
      }
  
      next();
    } catch (error) {
      console.error('Error in checkUnique middleware:', error);
  
      return res.status(500).json({
        error: 'Đã xảy ra lỗi trong quá trình kiểm tra email. Vui lòng thử lại sau.'
      });
    }
  };
  
  module.exports = checkUnique;
  