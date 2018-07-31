"use strict"

 /*
  * app/routes/jobs/adminJobHandler.js
  *
  * @Class AdminJobHandler
  * This class is meant to handle all of the requests that are
  * intended for job functions at the REST API endpoint
  * /api/jobs/*. 
  *
  * @see app/routes/jobs/router.js
  */

  class AdminJobHandler {

   /*
    * @param (Obj) requestHelpers - functions for requests
    * @param (Obj) EmployerModel
    */

    constructor(requestHelpers, EmployerModel, JobModel, QuestionModel, AnswerModel, InviteModel, mailer) {
      this.reqHelper = requestHelpers
      this.Employer = EmployerModel
      this.Job = JobModel
      this.Question = QuestionModel 
      this.Answer = AnswerModel
      this.Invite = InviteModel
      this.mailer = mailer
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

      var jobId = req.params.jobId
      const Job = this.Job 
      const Employer = this.Employer
      const Mailer = this.mailer

     /*
      * First, attempt to find the job to get all the job details.
      */

      Job.findOne({
        where: {
          job_id: jobId
        }
      })

      .then((job) => {
        
        /*
         * If we couldn't find the job at all
         */
        
        if (job === null) {

          res.status(404).json({
            message: 'The requested resource doesnt exist.'
          })

        }

        /*
         * If the job exists in the database, then we'll go ahead
         * and update it.
         *
         */

        else {

         /*
          * But hold on, we'll only continue to do all of this if the
          * job isn't already verified. We don't want to send another verified
          * email if the job has already been verified.
          */

          if (job.verified === false) {

            Job.update({
              verified: 1
            }, {
              where: {
                job_id: jobId
              }
            })

            /*
             * Success. We've updated the record and now it's time to send a
             * notification email to the employer of which the job belongs to.
             */

            .then((result) => {

              Employer.methods.getEmployerInfoById(job.posted_by)

              .then((employer) => {

               /*
                * We've accumulated all the required employer information to send the email
                * and at this point the job has been verified. Lets send away the email
                * and let the employer know the job is verified.
                */

                if (employer[0] !== null && employer[0] !== undefined) {

                  var employerName = employer[0].user_firstName + " " + employer[0].user_lastName
                  var email = employer[0].user_email
                  var jobTitle = job.title

                  Mailer.queueJobVerifiedEmail(employerName, email, jobTitle, req.decoded.userId)

                   /*
                    * Successfully queued the job verified email.
                    */

                    .then(() => {

                     /*
                      * Resolve the request.
                      */

                      res.status(200).json({
                        message: 'Successfully set job to verified.'
                      })

                    })

                   /*
                    * Could not queue the job verified email.
                    */

                    .catch((err) => {

                      res.status(500).json({
                        success: false,
                        message: 'Some error occurred queuing the job verified email.'
                      })

                    })

                }

               /*
                * Couldn't find the employer that posted the job, weirdly.
                * This must mean that we've deleted the employer profile
                * without deleting the job also. Impossible if we've properly
                * done foreign key relationships.
                */

                else {

                  res.status(500).json({
                    message: 'An error (albeit unexpected) occurred.'
                  })

                }

              })

             /*
              * Could not get employer data.
              * Probably the result of a SQL error
              */

              .catch((err) => {

                console.log(err)

                res.status(500).json({
                  message: 'Could not get employer data.'
                })

              })

            })

            /*
             * For some reason, we couldn't update the sequelize record.
             */

            .catch((err) => {

              console.log(err)

              res.status(500).json({
                message: 'Error occurred trying to update the job to verified.'
              })

            })
          }

         /*
          * 409 - conflict. We've already verified the job. No need
          * to do it again and resend the verification email.
          */

          else {

            res.status(409).json({
              message: 'Job already verified and email already sent.'
            })

          }

        }


      })

     /*
      * Could not get the Job because some sequelize error
      * occurred.
      */

      .catch((err) => {

        res.status(500).json({
          message: 'Some error occurred trying to call this endpoint'
        })

      })
      
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

      var jobId = req.params.jobId
      const Job = this.Job
      const ReqHelper = this.reqHelper
      const Employer = this.Employer
      const Mailer = this.mailer

     /*
      * Get job details. Most importantly, we just need to know who posted
      * the job so that we can get the employer email, name and job title.
      */

      Job.findOne({
        where: {
          job_id: jobId
        }
      })

     /*
      * Found the job, we can go ahead and take what we need from it.
      */

      .then((job) => {

        var employerId = job.posted_by;

       /*
        * Now delete the job and any associated stuff 
        * for that job.
        */

        ReqHelper.forceDeleteJob(jobId)

          .then((result) => {

            Employer.methods.getEmployerInfoById(employerId)

              .then((employer) => {

               /*
                * Now send the mail to the employer of the job.
                */

                if (employer[0] !== null && employer[0] !== undefined) {

                  var employerName = employer[0].user_firstName + " " + employer[0].user_lastName
                  var email = employer[0].user_email
                  var jobTitle = job.title

                  Mailer.queueJobRejectedEmail(employerName, email, jobTitle, req.decoded.userId)

                    /*
                    * Successfully queued the job rejected email.
                    */

                    .then(() => {

                     /*
                      * Resolve the request.
                      */

                      res.status(200).json({
                        message: 'Successfully removed the job that was rejected.'
                      })

                    })

                   /*
                    * Failued to queue the job rejected email.
                    */

                    .catch((err) => {

                      res.status(500).json({
                        message: 'Failed to queue the job rejected email.',
                        success: false
                      })

                    })                 

                } 

                else {

                  res.status(404).json({
                    message: 'Apparently there was no employer found to send an email to'
                  })

                }

              })

             /*
              * Some issue trying to get the employer info.
              */

              .catch((err) => {

                console.log(err)

                res.status(500).json({
                  message: 'There was a problem acquiring employer information to send en email.'
                })


              })

          })

         /*
          * There was a problem deleting all the material
          * in the database for that job.
          */

          .catch((err) => {

            console.log(err)

            res.status(500).json({
              message: 'Problem deleting job from db.'
            })

          })

      })

      .catch((err) => {
        console.log(err)

        res.status(500).json({
          message: "Problem actually finding the job to delete from jobid=" + jobId
        })

      })
    }

   /*
    * handleGetAllJobs
    * API: /api/jobs/
    * Method: GET
    * Desc: Get all jobs, questions and 
    * the respective answers for all questions.
    *
    */

    handleGetAllJobs (req, res) {

      var userId = req.decoded.userId

      this.Job.methods.__adminGetAllJobs()
        .then((result) => {
          if (result.length != 0) {
            res.json(result)
          } 
          
          else {
            res.json({
              jobs: [],
              questions: [],
              answers: [],
              applicants: [],
              invites: []
            })
          }
        })
        .catch((err) => {
          res.status(500).json({
            error: err.toString()
          })
        })
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
      const jobId = req.params.id 
      const userId = req.decoded.userId 

      var _Job = this.Job 
      var _Question = this.Question 
      var _Answer = this.Answer 
      var _reqHelper = this.reqHelper

      if (isNaN(jobId)) {
        
        res.status(400).json({
          message: "Bad request."
        })

      } else {

       /* First, confirm that this is a job that belongs to this employer
        * because Employers can only see their own jobs- no one elses. 
        */

        _reqHelper.getEmployerId(userId)

       /* If this job belongs to this Employer, then we'll allow the rest
        * of the request.
        */

          .then(() => {

            var jobPromise = _Job.find({
              where: {
                job_id: jobId
              }
            })

            var questionPromise = _Question.findAll({
              where: {
                job_id: jobId
              }
            })

            var answersPromise = _Answer.findAll({
              where: {
                job_id: jobId 
              }
            })

            Promise.all([jobPromise, questionPromise, answersPromise])
              .then((result) => {

                if (result[0] !== null) {
                  res.json({
                    job: result[0],
                    questions: result[1],
                    answers: result[2]
                  })
                } else {
                  res.status(404).json({
                    message: "Job not found."
                  })
                }
              })
              .catch((err) => {
                res.status(500).json({
                  err: err.toString()
                })
              })
          })

         /*
          * Employer id not found because the account was deleted
          * or something.
          */

          .catch((err) => {
            res.status(404).json({
              error: err.toString()
            })
          })

      }
    }

  }

  module.exports = AdminJobHandler