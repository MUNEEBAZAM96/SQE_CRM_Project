const mongoose = require('mongoose');

const logout = async (req, res, { userModel }) => {
  const UserPassword = mongoose.model(userModel + 'Password');

  // const token = req.cookies[`token_${cloud._id}`];

  // Try to get token from Authorization header first, then from cookies
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Extract the token
  
  // Fallback to cookie if Authorization header is not present
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (token)
    await UserPassword.findOneAndUpdate(
      { user: req.admin._id },
      { $pull: { loggedSessions: token } },
      {
        new: true,
      }
    ).exec();
  else
    await UserPassword.findOneAndUpdate(
      { user: req.admin._id },
      { loggedSessions: [] },
      {
        new: true,
      }
    ).exec();

  return res.json({
    success: true,
    result: {},
    message: 'Successfully logout',
  });
};

module.exports = logout;
