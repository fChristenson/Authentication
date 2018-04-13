// this is the easiest middleware but if you have roles
// you will have middleware that checks if the user is
// logged in and the user has the correct role
module.exports = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect("/401");
};
