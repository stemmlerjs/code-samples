
/*
* app/routes/index.js
*
* Defines the API routes for the backend.
*/

module.exports = function(app, models) {

  var express = require('express')
  const fileUpload = require('express-fileupload');
  const testsRouter = require('./tests').testsRouter
  var apiRouter = express.Router()
  var registrationHandler = require('./registration')
  var loginLogoutHandler = require('./loginLogout')
  var listsHandler = require('./lists')
  var schoolHandler = require('./lists/school')
  var tagsHandler = require('./tags')
  var profileHandler = require('./profile').profileHandler
  var apiMeRouter = require('./profile').apiMeRouter
  var jobsRouter = require('./jobs').jobsRouter
  var studentRouter = require('./student').studentRouter
  var applicantRouter = require('./applicant').applicantRouter
  var passwordResetRouter = require('./password').passwordResetRouter
  var publicViewRouter = require('./public').publicViewRouter
  var emailTrackingRouter = require('./emailTracking')
  var eventsHandler = require('./event').eventRouter
  var conversationsHandler = require('./conversation').conversationRouter
  var couponRouter = require('./coupon').couponRouter
  var accountRouter = require('./account').accountRouter
  
  var jwt = require('jsonwebtoken')
  var config = require('../../config')
  var middleware = require('./middleware')

 /*
  * Allow CORS requests if we're in development.
  */

  if (!config.isProd) {
    app.all('/*', middleware.allowCrossDomainFromAll)
  }

  else {
    app.all('/*', middleware.allowCrossDomainFromProdUrl)
  }

  // Sanitize all routes
  apiRouter.use(middleware.sanitizeRequests)

  // Public routes
  apiRouter.post('/admin/verify', middleware.handleVerifyAdminUser)
  
  apiRouter.post('/login', loginLogoutHandler.handleLogin)
  apiRouter.get('/list', listsHandler.handleGetAllLists)
  apiRouter.get('/list/all', listsHandler.handleGetAllStaticLists)
  apiRouter.use('/list/school', schoolHandler)
  apiRouter.get('/list/:choice', listsHandler.handleGetSpecificList)
  apiRouter.use('/password', passwordResetRouter)
  apiRouter.use('/public', publicViewRouter)
  apiRouter.post('/register', registrationHandler.handleStudentRegistration)
  apiRouter.post('/register/business', registrationHandler.handleEmployerRegistration)
  apiRouter.use('/squeaky', testsRouter)
  apiRouter.post('/verify/:token', registrationHandler.handleVerifyEmail)

  // Authenticated routes
  apiRouter.use(middleware.authenticateRequests)
  apiRouter.put('/verify', registrationHandler.regenerateVerifyToken)
  apiRouter.post('/logout', loginLogoutHandler.handleLogout)
  apiRouter.get('/emailtx', emailTrackingRouter.getAllEmails)
  apiRouter.post('/tags/skills', tagsHandler.handleQueryLikeSkills)
  apiRouter.use('/me', apiMeRouter)
  apiRouter.use('/jobs', jobsRouter)
  apiRouter.use('/students', studentRouter)
  apiRouter.use('/applicants', applicantRouter)
  apiRouter.use('/event', eventsHandler)
  apiRouter.use('/conversation', conversationsHandler)
  apiRouter.use('/coupon', couponRouter)
  apiRouter.use('/account', accountRouter)
  app.use('/api/v1', apiRouter)
}


