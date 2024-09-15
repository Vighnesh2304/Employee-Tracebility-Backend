const jwt = require("jsonwebtoken");

const getToken = (data) => {
  let data1 = {
    first_name: data.first_name,  // Make sure this has a value
    user_id: data.user_id,
    employee_id: data.employee_id,
    role: data.role,
  };
  const token = jwt.sign(data1, process.env.JWT_SECRET);
  return token;
};

const sendToken = (user, statusCode, res) => {
  const token = getToken(user);

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    first_name: user.first_name,  // Ensure this is correctly set
    role: user.role,
  });
};

module.exports = sendToken;
