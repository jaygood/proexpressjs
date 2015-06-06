module.exports = {
  checkAdmin(req, res, next) {
    const {auth, userId, admin} = req.session ? req.session : {};
    return auth && userId && admin ?
      console.info(`Access ADMIN: ${userId}`) && next() :
      next('User is not ad administrator');
  },
  checkApplicant(req, res, next) {
    const {auth, userId, approved, admin} = req.session ? req.session : {};
    return auth && userId && (approved || admin) ?
      next() :
      next('User is not logged in');
  }
};