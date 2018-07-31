"use strict" 

 /*
  * app/routes/jobs/jobsHandler.js
  *
  * @Class JobsHandler
  * This class is meant to branch off and proxy the co-located
  * request handlers for all /api/jobs endpoints. 
  *
  * Co-locates the requests based on Student vs Employer requests.
  *
  * @see EmployerProfileHandler
  * @see StudentProfileHandler
  */ 
  
  const mailer = require('../../mailer')
  const reqHelper = require('../requestHelpers')
  const Models = require('../../models')
  const Stripe = require('../../../config').stripe
  const Employer = Models.Employer
  const BaseUser = Models.BaseUser
  const Student = Models.Student
  const Answer = Models.Answer
  const Job = Models.Job
  const Question = Models.Question
  const PinnedJob = Models.PinnedJob
  const Applicant = Models.Applicant
  const Invite = Models.Invite

  const EmployerJobHandlerFactory = require('./employerJobHandler')
  const EmployerJobHandler = new EmployerJobHandlerFactory(reqHelper, Employer, Job, Question, Answer, Invite, Applicant, mailer, Models, Stripe)

  const AdminJobHandlerFactory = require('./adminJobHandler')
  const AdminJobHandler = new AdminJobHandlerFactory(reqHelper, Employer, Job, Question, Answer, Invite, mailer, Models)

  const StudentJobHandlerFactory = require('./studentJobHandler')
  const StudentJobHandler = new StudentJobHandlerFactory(reqHelper, Student, Job, Question, PinnedJob, Applicant, mailer, Models)

 /*
  * Class Definition
  */

  class JobsHandler {

   /*
    * handleGetAllJobs
    * API: /api/jobs/
    * Method: GET
    * RestrictedTo: Students AND Employers
    * Desc: Get all jobs. Students get all jobs and all questions, Employers
    *       get only their own jobs, questions and answers.
    */

    handleGetAllJobs (req, res) {

      const isAStudent = req.decoded.isAStudent
      const adminUser = req.decoded.adminUser

      // if (adminUser) {
      //   AdminJobHandler.handleGetAllJobs(req, res)
      // }

      // else {
        if(!isAStudent) {
          EmployerJobHandler.handleGetAllJobs(req, res)
        } else {
          StudentJobHandler.handleGetAllJobs(req, res)
        }
      // }
    }

   /*
    * handleGetJobById
    * API: /api/jobs/:id
    * Method: GET
    * RouteParams: id - job id
    * RestrictedTo: Students AND Employers
    * Desc: Get a specific job. Students get all questions, Employers
    *       get all questions and student answers.
    */

    handleGetJobById (req, res) {
      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        EmployerJobHandler.handleGetJobById(req, res)
      } else {
        StudentJobHandler.handleGetJobById(req, res)
      }
    }

    /*
    * handleGetJobById
    * API: /api/jobs/:id/applicant
    * Method: GET
    * RouteParams: id - job id
    * RestrictedTo: Students AND Employers
    * Desc: Get a specific job. Students get all questions, Employers
    *       get all questions and student answers.
    */

    handleGetApplicantsByJobId (req, res) {
      const isAStudent = req.decoded.isAStudent

      if(!isAStudent) {
        EmployerJobHandler.handleGetApplicantsByJobId(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      }
    }

    handleGetApplicantDetailsByJobId (req, res) {
      const isAStudent = req.decoded.isAStudent

      if(!isAStudent) {
        EmployerJobHandler.handleGetApplicantDetailsByJobId(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      }
    }

   /*
    * handleApplyToJob
    * API: /api/jobs/:jobId/apply
    * Method: POST
    * RestrictedTo: Students
    * Desc: Apply to a job and answer all questions.
    */

    handleApplyToJob (req, res) {

      const isAStudent = req.decoded.isAStudent

      if(isAStudent) {
        StudentJobHandler.handleApplyToJob(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to students only."
        })
      }

    }

   /*
    * handleGetAllJobsAppliedTo
    * API: /api/jobs/applied
    * Method: GET
    * RestrictedTo: Students
    * Desc: Get all jobs that the student has applied to.
    */

    handleGetAllJobsAppliedTo (req, res) {

      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        res.status(403).json({
          error: "Restricted to students only."
        })
      } else {
        StudentJobHandler.handleGetAllJobsAppliedTo(req, res)
      }

    }

   /*
    * handleCreateNewJob
    * API: /api/jobs/new
    * Method: POST
    * RestrictedTo: Employers
    * Desc: Post a new job.
    */

    handleCreateNewJob (req, res) {

      const isAStudent = req.decoded.isAStudent

      if(!isAStudent) {
        EmployerJobHandler.handleCreateNewJob(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      }

    }


   /*
    * handleInviteStudentToJob
    * API: /api/jobs/invite/:jobId/:studentId
    * Method: POST
    * RouteParams: jobId - job id, studentId - student id
    * RestrictedTo: Employers
    * Desc: Invite a student to a job.
    */

    handleInviteStudentToJob (req, res) {

      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        EmployerJobHandler.handleInviteStudentToJob(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      }
    }

   /*
    * handleVerifyJob
    * API: /api/jobs/verify/:jobId
    * Method: POST
    * RouteParams: jobId - job id
    * RestrictedTo: Admins
    * Desc: Verify a job, approve it.
    */

    handleVerifyJob (req, res) {
      const adminUser = req.decoded.adminUser

      if (adminUser) {
        AdminJobHandler.handleVerifyJob(req, res)
      }

      else {
        res.status(403).json({
          error: "Restricted to admin only."
        })
      }
    }

   /*
    * handleDenyJob
    * API: /api/jobs/deny/:jobId
    * Method: POST
    * RouteParams: jobId - job id
    * RestrictedTo: Admins
    * Desc: Deny a job from being verified, approved into the ap.
    */

    handleDenyJob (req, res) {
      const adminUser = req.decoded.adminUser

      if (adminUser) {
        AdminJobHandler.handleDenyJob(req, res)
      }

      else {
        res.status(403).json({
          error: "Restricted to admin only."
        })
      }

    }

    /*
    * handleDenyJob
    * API: /api/jobs/invite/:jobId
    * Method: GET
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Gets all of the students that this employer has invited to this
    * job.
    */


    handleGetAllInvitedStudentsForJob (req, res) {

      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        EmployerJobHandler.handleGetAllInvitedStudentsForJob(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      }

    }

   /*
    * handleCloseJob
    * API: /api/jobs/:jobId/close/
    * Method: POST
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Close a job.
    */

    handleCloseJob (req, res) {
      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        EmployerJobHandler.handleCloseJob(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      }
    }

    /*
    * handleEditJob
    * API: /api/jobs/:jobId/edit
    * Method: PATCH
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Edit a job
    */

    handleEditJob (req, res) {
      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        EmployerJobHandler.handleEditJob(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      }
    }

  /**
    * handleRepostJob
    * API: /api/jobs/:jobId/repost
    * Method: POST
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Edit a job
    */

    handleRepostJob (req, res) {
      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        EmployerJobHandler.handleRepostJob(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      }
    }

   /**
    * handleGetApplicantsStatsByJobId
    * API: /api/jobs/:jobId/applicant/stats
    * Method: GET
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Get number of applicants
    */

    handleGetApplicantsStatsByJobId (req, res) {
      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        EmployerJobHandler.handleGetApplicantsStatsByJobId(req, res)
      } else {
        res.status(403).json({
          error: "Restricted to employers only."
        })
      } 
    }

    /**
    * handleSearchJobs
    * API: /api/jobs/search
    * Method: POST
    * RestrictedTo: Students
    * Desc: Get jobs
    */

    handleSearchJobs (req, res) {
      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        res.status(403).json({
          error: "Restricted to students only."
        })
      } else {
        StudentJobHandler.handleSearchJobs(req, res)
      }
    }

   /**
    * handleGetAllJobsInvitedTo
    * API: /api/jobs/invited
    * Method: GET
    * RestrictedTo: Students
    * Desc: Get jobs invited to
    */

    handleGetAllJobsInvitedTo (req, res) {
      const isAStudent = req.decoded.isAStudent

      if (!isAStudent) {
        res.status(403).json({
          error: "Restricted to students only."
        })
      } else {
        StudentJobHandler.handleGetAllJobsInvitedTo(req, res)
      }
    }
  }

  module.exports = new JobsHandler