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
  // Generate token based on user information (e.g., user_id, role)
  const token = getToken(user);

  // Cookie options
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000 
    ),
    httpOnly: true, 
    path: "/",
    secure: true,
    sameSite: 'none', // Adjust based on your needs (None, Lax, Strict)
  };

  // Send the token as a cookie and return user data
  res.status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,  // JWT token sent back in response (optional)
      first_name: user.first_name,  // Assuming user has `first_name` in the database
      role: user.role,  // Ensure `role` is present in the user object
    });
};


module.exports = sendToken;
