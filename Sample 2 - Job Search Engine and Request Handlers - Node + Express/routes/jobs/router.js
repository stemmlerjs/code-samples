
 /*
  * app/routes/jobs/router.js
  *
  * Defines the API routes for /api/jobs
  */

  const jobsRouter = require('express').Router()
  const jobsHandler = require('./jobsHandler')

  // Invites Router is used for /jobs/invite
  // urls.
  const invitesRouter = require('../invite').invitesRouter;
  jobsRouter.use('/invite', invitesRouter);

  // Questions router
  const questionsRouter = require('../questions').questionsRouter;

  // Pinned Jobs router
  const pinnedJobsRouter = require('../pins').pinnedJobsRouter;
  jobsRouter.use('/pins', pinnedJobsRouter);

  jobsRouter.use('/:jobId/questions', 

    /*
     * Attach the :jobId parameter to the request
     * so that the QuestionsRouteHandler class can access it in 
     * its methods.
     */

    function(req, res, next) {
      req.jobId = req.params.jobId;
      next()
    }, 

  questionsRouter);

  // Metrics router
  const metricsRouter = require('../metric').metricsRouter;

  jobsRouter.use('/:jobId/metric', 

    /*
     * Attach the :jobId parameter to the request
     * so that the QuestionsRouteHandler class can access it in 
     * its methods.
     */

    function(req, res, next) {
      req.jobId = req.params.jobId;
      next()
    }, 

  metricsRouter);

  jobsRouter.get('/applied', jobsHandler.handleGetAllJobsAppliedTo)
  jobsRouter.get('/invited', jobsHandler.handleGetAllJobsInvitedTo)

  // Student and Employer URLS
  jobsRouter.get('/', jobsHandler.handleGetAllJobs)
  jobsRouter.post('/search', jobsHandler.handleSearchJobs)
  jobsRouter.get('/:jobId', jobsHandler.handleGetJobById)
  jobsRouter.get('/:jobId/applicant', jobsHandler.handleGetApplicantsByJobId)
  jobsRouter.get('/:jobId/applicant/stats', jobsHandler.handleGetApplicantsStatsByJobId)
  jobsRouter.get('/:jobId/applicant/:applicantId', jobsHandler.handleGetApplicantDetailsByJobId)
  
  // Student URLS
  jobsRouter.use('/pins', pinnedJobsRouter)

  jobsRouter.post('/:jobId/apply', jobsHandler.handleApplyToJob) 
  

  // Employer URLS
  jobsRouter.post('/new', jobsHandler.handleCreateNewJob)
  
  jobsRouter.post('/:jobId/close/', jobsHandler.handleCloseJob)
  jobsRouter.patch('/:jobId/edit', jobsHandler.handleEditJob)
  jobsRouter.post('/:jobId/repost', jobsHandler.handleRepostJob)

  // Admin URLS
  jobsRouter.post('/verify/:jobId', jobsHandler.handleVerifyJob)
  jobsRouter.post('/deny/:jobId', jobsHandler.handleDenyJob)
  
  module.exports = jobsRouter
  