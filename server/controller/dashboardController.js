function showLogin(req, res) {
  if (req.session.admin) {
    return res.redirect('/dashboard');
  }
  res.render('dashboard/login', { title: 'Admin Login', error: null });
}

function showHome(req, res) {
  res.render('dashboard/home', { title: 'Dashboard', admin: req.session.admin });
}

module.exports = { showLogin, showHome };