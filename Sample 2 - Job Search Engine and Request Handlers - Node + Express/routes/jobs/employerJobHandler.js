"use strict"

 /*
  * app/routes/jobs/employerJobsHandler.js
  *
  * @Class EmployerJobsHandler
  * This class is meant to handle all of the requests that are
  * intended for Employer related job functions at the REST API endpoint
  * /api/jobs/*. 
  *
  * @see app/routes/jobs/router.js
  */

  class EmployerJobsHandler {

   /*
    * @param (Obj) requestHelpers - functions for requests
    * @param (Obj) EmployerModel
    */

    constructor(requestHelpers, EmployerModel, JobModel, QuestionModel, AnswerModel, InviteModel, ApplicantModel, mailer, models, stripe) {
      this.reqHelper = requestHelpers
      this.Employer = EmployerModel
      this.Job = JobModel
      this.Question = QuestionModel 
      this.Answer = AnswerModel
      this.Invite = InviteModel
      this.Applicant = ApplicantModel
      this.mailer = mailer
      this.models = models
      this.stripe = stripe
    }

   /*
    * handleCreateNewJob
    * API: /api/jobs/new  
    * Method: POST
    * Desc: Create a new job.

    PAYMENT TYPES:
    TODO: Make these tables and shit.

    var setPayments = [{
      id: 0,
      name: 'hr'
    },{
      id: 1,
      name: 'year'
    }, {
      id: 3,
      name: 'monthly'
    }, {
      id: 3, 
      name: 'single payment'
    }]

    const rangePayments = [{
      id: 0,
      name: 'hr'
    },{
      id: 1,
      name: 'year'
    }, {
      id: 2,
      name: 'monthly'
    }]
    *
    */

    async handleCreateNewJob (req, res) {

      const self = this;
      const _reqHelper = this.reqHelper
      const Stripe = this.stripe;

      const userId = req.decoded.userId
      const stripeToken = req.body.stripe_token;

      const title = req.body.title 
      var jobType = Number(req.body.job_type_id)
      var paid = req.body.paid
      var closingDate = new Date(req.body.closing_date)
      var responsibilities = req.body.responsibilities
      var qualifications = req.body.qualifications
      var location = req.body.address 
      var compensation = req.body.compensation 
      var maxApplicants = req.body.max_applicants

      var remoteWork = req.body.remote_work
      var numPositions = Number(req.body.num_positions)

      var desiredSkills = req.body.desired_skills;
      var paidJobDetails = req.body.paid_job_details;

      var linkbackEnabled = req.body.linkback_enabled;
      var linkbackUrl = req.body.linkback_url;
      var couponCode = req.body.coupon_code;
      
     /* Questions are optional. If they're included, they must 
      * be filled out in full. 
      */

      var questionOneText = req.body.question_one_text
      var questionOneType = req.body.question_one_type

      var questionTwoText = req.body.question_two_text
      var questionTwoType = req.body.question_two_type

      let employer;
      let baseUser;
      let questions = {}

      let slug;

      /*
       * Get the employer account
       */

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }})
        baseUser = await employer.getBaseUser();
        // If profile not complete, say goodbye
        if (!baseUser.is_profile_complete) {
          return res.status(405).json({
            success: false,
            err: "Please complete your profile first before creating job postings."
          })
        }
      }

      /**
       * Failed to find the employer/base user.
       */

      catch (err) {
        console.log(err)
        return res.status(500).json({
          error: err.toString()
        })
      }

      try {
        // Check that required fields have been included
        await _reqHelper.allKeysPresent(
          [title, jobType, paid, closingDate, responsibilities, qualifications, compensation,
          maxApplicants, numPositions, desiredSkills, paidJobDetails, remoteWork], 
          ['title', 'job_type', 'paid', 'closing_date', 'responsibilities', 'qualifications',
          'compensation', 'max_applicants', 'num_positions', 'desired_skills', 'paid_job_details', 'remote_work']
        )

        // Check simple ids
        await _reqHelper.checkType(
          [jobType, maxApplicants, numPositions],
          ['job_type', 'max_applicants', 'num_positions'], 'number', true
        )

        // Decode desired skills and paid job details
        try {
          desiredSkills = JSON.parse(req.body.desired_skills)
          paidJobDetails = JSON.parse(req.body.paid_job_details)
        }

        catch (err) {
          return res.status(400).json({
            message: "Must include 'desired_skill' and 'paid_job_details' stringified strings."
          })
        }
      }

      catch (err) {
        console.log(err)
        return res.status(400).json({
          error: err.toString()
        })
      }

      // If questions are included, ensure that they are
      // filled out in full.

      try {
        

        /* If Question 1 text is included in the request, let's
          * ensure that the question type selected was valid.
          * If it's valid, we'll include this as a question to add
          * for this job posting.
          */

        if (questionOneText !== null && questionOneText != "" && questionOneText !== undefined) {
          await _reqHelper.checkType([questionOneType], ['question_one_type'], 'number', false)
          questions.Q1 = {
            type: questionOneType,
            text: questionOneText
          }
        }

        if (questionTwoText !== null && questionTwoText != "" && questionTwoText !== undefined) {
          await _reqHelper.checkType([questionTwoType], ['question_two_type'], 'number', false);
          questions.Q2 = {
            type: questionTwoType,
            text: questionTwoText
          }
        }
      }

      catch (err) {
        console.log(err)
        res.status(400).json({
          error: err.toString()
        })
      }

      /**
       * Create a slug for this job.
       */
      
      slug = self.models.Job.prototype.createSlug(title);

      /*
       * Now, we create the job
       */ 

      try {
        const job = await self.models.Job.create({
          title: title,
          employer_id: employer.employer_id,
          job_type_id: jobType,
          paid: paid,
          closing_date: closingDate,
          responsibilities: responsibilities,
          qualification: qualifications,
          location: remoteWork == 'false' ? location : employer.office_address + ' ' + employer.office_city,
          compensation: compensation,
          max_applicants: maxApplicants,
          verified: false,
          remote_work: remoteWork,
          num_positions: numPositions,
          active: true,
          paid_job_type: paid ? paidJobDetails.paymentChoice : null,
          paid_job_range_min: paid && paidJobDetails.paymentChoice === "range" ? paidJobDetails.rangeConfig.minValue : null,
          paid_job_range_max: paid && paidJobDetails.paymentChoice === "range" ? paidJobDetails.rangeConfig.maxValue : null,
          paid_job_set_value: paid  && paidJobDetails.paymentChoice === "set" ? paidJobDetails.setConfig.value : null,
          paid_job_work_unit: paid  && paidJobDetails.paymentChoice === "set" ? paidJobDetails.setConfig.paymentTypeId 
            : paid && paidJobDetails.paymentChoice === "range" 
              ? paidJobDetails.rangeConfig.paymentTypeId
              : null,
          slug: slug,
          company_name: employer.company_name,
          linkback_enabled: linkbackEnabled,
          linkback_url: linkbackUrl
        })

        // Add questions
        if (questions.Q1) await self.models.Job.prototype.createQuestion(questions.Q1.type, questions.Q1.text, job);
        if (questions.Q2) await self.models.Job.prototype.createQuestion(questions.Q2.type, questions.Q2.text, job);

        // Add Desired skills
        var newSkillsArr = desiredSkills.new;
        var idSkillsArr = desiredSkills.ids;
        await self.models.TagDesiredSkills.prototype.handleAddDesiredSkills(newSkillsArr, idSkillsArr, job);

        console.log(`>>> Created a new job [id=${job.job_id}]: https://app.univjobs.ca/posting/${slug}`);

        // Create the customer in stripe
        let customer;
        let stripeCustomerId;

        try {
          await self.models.Customer.prototype.handleCreateNewCustomer(baseUser, stripeToken);
        }

        // If we couldn't create the customer in stripe, then we need to
        // fail the API call and get rid of the job.
        catch(err) {
          console.log(err);
          await job.destroy();
          return res.status(500).json({
            error: err.toString()
          })
        }

        // Apply the coupon code if there was one.
        if (couponCode) {
          try {
            let coupon = await self.models.Coupon.findOne({ 
              where: { 
                code: couponCode,
                is_enabled: true
              }
            })

            if (coupon) {
              await self.models.JobCoupon.create({ coupon_id: coupon.coupon_id, job_id: job.job_id })
            }
          }

          catch(err) {
            console.log(`>>> An error occurred while applying the coupon=${couponCode}`)
            console.log(err);
          }
        }

        // Return request
        return res.status(201).json({
          job: job,
          questions: questions
        })
      }

      catch (err) {
        console.log(err);
        return res.status(500).json({
          error: err.toString()
        })
      }
    }

   /*
    * handleGetJobById
    * API: /api/jobs/mypostings/:jobId
    * Method: GET
    * Desc: Get the my postings job details. This route is used on:
    * - /mypostings/open/:jobId
    * - /mypostings/closed/:jobId
    * - /mypostings/awaiting/:jobId
    */

    async handleGetAllJobs (req, res) {

      const self = this;

      const sequelize = self.models.sequelize;
      let userId = req.decoded.userId
      let jobs;
      let employer;

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }})

        let startTime = new Date();
        jobs = await self.models.Job.findAll({
          where: {
            employer_id: employer.employer_id
          },
          include: [{
            model: self.models.Applicant,
              as: 'Applicants'
            }, {
              model: self.models.Question,
              as: 'Questions'
            }, {
              model: self.models.Invite,
              as: 'Invites'
            }, {
              model: self.models.ListsSkills,
              as: "DesiredSkills"
            }, {
              model: self.models.ListsJobTypes,
              as: 'JobType'
            }]
        })

        jobs = jobs.map((job) => {
          return Object.assign({}, job.toJSON(), {
            numApplicantsInitial: job.Applicants.filter(applicant => applicant.state == "INITIAL").length,
            numApplicantsContacted: job.Applicants.filter(applicant => applicant.state == "CONTACTED").length,
            numApplicantsRejected: job.Applicants.filter(applicant => applicant.state == "REJECTED").length,
            numApplicantsHired: job.Applicants.filter(applicant => applicant.state == "HIRED").length
          })
        })

        let endTime = new Date();
        console.log(`Retrieved all jobs in ${endTime - startTime}`)

      }
      catch (err) {
        console.log(err)
        return res.status(500).json({
          error: err.toString()
        })
      }

      return res.json({
        jobs: jobs
      })
    }

    /*
    * handleGetApplicantsByJobId
    * API: /api/jobs/:jobId/applicant
    * Method: GET
    * Desc: Get the my postings job details. This route is used on:
    * - /mypostings/open/:jobId
    * - /mypostings/closed/:jobId
    * - /mypostings/awaiting/:jobId
    *
    */

    async handleGetApplicantsByJobId (req, res) {
      const self = this;
      const jobId = req.params.jobId;
      let userId = req.decoded.userId
      let applicants;
      let employer;

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }})

        applicants = await self.models.Applicant.findAll({
          where: {
            job_id: jobId
          },
          include:[{
            model: self.models.Student,
            as: "Student",
            include: [{ 
              model: self.models.BaseUser, as: 'BaseUser', 
              attributes: self.models.BaseUser.prototype.basicQueryAttributes 
            },
            { model: self.models.School, as: 'School' },
            { model: self.models.ListsAreaOfStudy, as: 'AreaOfStudy' }]
          }]
        })
      }
      catch(err) {
        console.log(err)
        return res.status(500).json({
          error: err.toString()
        })
      }

      return res.json({
        applicants: applicants
      })

    }

   /*
    * handleGetApplicantDetailsByJobId
    * API: /api/jobs/:jobId/applicant/:applicantId
    * Method: GET
    * Desc: Get the my postings job details. This route is used on:
    * - /mypostings/open/:jobId
    * - /mypostings/closed/:jobId
    * - /mypostings/awaiting/:jobId
    *
    */

    async handleGetApplicantDetailsByJobId (req, res) {
      const self = this;
      const jobId = req.params.jobId;
      const applicantId = req.params.applicantId;
      let userId = req.decoded.userId
      let applicant;
      let employer;

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }})

        applicant = await self.models.Applicant.findOne({
          where: {
            job_id: jobId,
            applicant_id: applicantId
          },
          include: [{
            model: self.models.Student,
            as: "Student",
            include: [
              { model: self.models.ListsAreaOfStudy, as: 'AreaOfStudy' },
              { model: self.models.ListsClubs, as: 'Clubs' },
              { model: self.models.ListsEmailPrefs, as: 'EmailPrefs' },
              { model: self.models.ListsEduLevels, as: 'EduLevel' },
              { model: self.models.ListsGenders, as: 'Gender' },
              { model: self.models.ListsLanguages, as: 'Languages' },
              { model: self.models.School, as: 'School' },
              { model: self.models.ListsSports, as: 'Sports' },
              { model: self.models.ListsSkills, as: 'Skills' },
              { model: self.models.ListsStudentStatuses, as: 'StudentStatus' },
              { model: self.models.BaseUser, as: 'BaseUser', 
                attributes: self.models.BaseUser.prototype.basicQueryAttributes }
            ]
          }, {
            model: self.models.Answer,
            as: 'Answers'
          }]
        })
      }
      catch(err) {
        console.log(err)
        return res.status(500).json({
          error: err.toString()
        })
      }

      return res.json({
        applicant: applicant
      })
    }

   /*
    * handleGetJobById
    * API: /api/jobs/:jobId
    * Method: GET
    * Desc: Get the my postings job details. This route is used on:
    * - /mypostings/open/:jobId
    * - /mypostings/closed/:jobId
    * - /mypostings/awaiting/:jobId
    *
    */

    async handleGetJobById (req, res) {
      const self = this;
      const jobId = req.params.jobId;
      let userId = req.decoded.userId
      let job;
      let employer;
      console.log("job id", jobId)

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }})

        let startTime = new Date();
        job = await self.models.Job.findOne({
          where: {
            job_id: jobId,
            employer_id: employer.employer_id
          },
          include: [{
            model: self.models.Applicant,
              as: 'Applicants',
//               include: [{
//                 model: self.models.Student,
//                 as: "Student",
//                 include: [
//                   { model: self.models.ListsAreaOfStudy, as: 'AreaOfStudy' },
//                   { model: self.models.ListsClubs, as: 'Clubs' },
//                   { model: self.models.ListsEmailPrefs, as: 'EmailPrefs' },
//                   { model: self.models.ListsEduLevels, as: 'EduLevel' },
//                   { model: self.models.ListsGenders, as: 'Gender' },
//                   { model: self.models.ListsLanguages, as: 'Languages' },
//                   { model: self.models.School, as: 'School' },
//                   { model: self.models.ListsSports, as: 'Sports' },
//                   { model: self.models.ListsSkills, as: 'Skills' },
//                   { model: self.models.ListsStudentStatuses, as: 'StudentStatus' },
//                   { model: self.models.BaseUser, as: 'BaseUser', 
//                     attributes: self.models.BaseUser.prototype.basicQueryAttributes }
//                 ]
//               }, {
//                 model: self.models.Answer,
//                 as: 'Answers',
// //                where: {
// //                  job_id: {$col: 'Applicants.job_id'}
// //                }
//               }]
            }, {
              model: self.models.Question,
              as: 'Questions'
            }, {
              model: self.models.Invite,
              as: 'Invites',
              include: [{
                model: self.models.Student,
                as: "Student",
                include: [{
                  model: self.models.BaseUser,
                  as: 'BaseUser',
                  attributes: ['user_firstName', 'user_lastName']
                }]
              }]
            }, {
              model: self.models.ListsSkills,
              as: "DesiredSkills"
            }, {
              model: self.models.ListsJobTypes,
              as: 'JobType'
            }]
        })

        let endTime = new Date();
        console.log(`Retrieved all jobs in ${endTime - startTime}`)

      }
      catch (err) {
        console.log(err)
        return res.status(500).json({
          error: err.toString()
        })
      }

      return res.json({
        job: job
      })
    }

   /*
    * handleCloseJob
    * API: /api/jobs/close/:jobId
    * Method: POST
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Close a job.
    */

    async handleCloseJob (req, res) {

      const self = this;
      const userId = req.decoded.userId
      const jobId = req.params.jobId

      const Mailer = this.mailer;

      let employer;
      let ownsJob;

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }, include: [{ model: self.models.BaseUser, as: 'BaseUser' }]})

        // Ensure that the employer owns this job.
        ownsJob = await employer.hasJob(jobId);

        // If the employer doesn't own this job, bye bye
        if (!ownsJob) return res.status(403).json({ message: "Employer doesn't own this job."})
      }

      catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.toString() })
      }

      /*
        * "What happens when a job gets closed?"
        * 
        * Well, for 1) we obviously switch the active bit from 1 to 0
        * on the job. That means it becomes a closed job.
        *
        * But what else happens? Who is notified about it?
        * What happens to the applicants of the job?
        */

        let job = await self.models.Job.findOne({ where: { job_id: jobId }});

        if (!job.active) {
          return res.status(400).json({
            message: "Job already closed"
          })
        }

        await job.update({ active: 0 });

        // We destroy the associated rows.

        await self.models.Invite.destroy({ where: { job_id: jobId }})
        await self.models.Answer.destroy({ where: { job_id: jobId }})
        await self.models.PinnedJob.destroy({ where: { job_id: jobId }})

       /*
        * Handle closing job side effects.
        * Manual close = true
        * 
        * Kill all invites
        * Send 'SEND_CLOSED_INITIAL_CONTACT' emails to all applicants.
        * Let the employer know that their job was closed.
        */

        await Mailer.closeJobSideEffects(jobId, userId, true);

        await self.models.Event.create({ event_type: 'JOB CLOSED', job_id: jobId, employer_id: employer.employer_id })

        res.status(204).json({
          message: "Successfully closed job"
        })
    }

   /*
    * handleEditJob
    * API: /api/jobs/:jobId/edit
    * Method: PATCH
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Edit a job
    */

    async handleEditJob (req, res) {
      const self = this;

      const userId = req.decoded.userId
      const jobId = req.params.jobId

      const ReqHelper = self.reqHelper

      let employer;
      let ownsJob;
      let job;

      const title = req.body.title
      const location = req.body.location
      const qualification = req.body.qualification
      const remoteWork = req.body.remote_work
      const reponsibilities = req.body.responsibilities
      const closingDate = req.body.closing_date
      const paid = req.body.paid 
      const compensation = req.body.compensation
      const jobTypeId = req.body.job_type_id;

      let keysPresent;

      let desiredSkills = req.body.desired_skills
      let paidJobDetails = req.body.paid_job_details;

      let linkback_url = req.body.linkback_url;

      /*
       * Permissions gathering:
       * Ensure that this user has rights to this job before we do 
       * any editing on it.
       */

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }, include: [{ model: self.models.BaseUser, as: 'BaseUser' }]})
        // Ensure that the employer owns this job.
        ownsJob = await employer.hasJob(jobId);
        // If the employer doesn't own this job, bye bye
        if (!ownsJob) return res.status(403).json({ message: "Employer doesn't own this job."});
        job = await self.models.Job.findOne({ where: { job_id: jobId }})
      }

      catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.toString() })
      }
      
      /*
       * Determine all of the simple keys that need to be updated.
       * Simple keys are keys that are of the type: Number, String 
       * or Date.
       * 
       * Complex keys are Objects and Arrays (they're usually 
       * stringified over the request).
       */
      
      try {
        keysPresent = await ReqHelper.whichKeysPresent(
          [title, location, qualification, remoteWork, reponsibilities, closingDate, paid, compensation, 
            jobTypeId, linkback_url],
          ['title', 'location', 'qualification', 'remote_work', 'responsibilities', 'closing_date', 
          'paid', 'compensation', 'job_type_id', 'linkback_url']
        )

        console.log(">>> Simple keys present in Job Update", keysPresent)

        // Update the job object basic keys
        try {
          await job.update(keysPresent, { where: { job_id: jobId }})
        }

        catch(err) {
          console.log(err)
          return res.status(400).json({
            message: "Error updating job",
            error: err.toString()
          })
        }
      }

      catch (err) {
        console.log(err)
        return res.status(400).json({
          error: err.toString()
        })
      }
      
      /*
       * Update DESIRED_SKILLS.
       * Desired Skills is a complex key because it comes in the 
       * form of a stringified array of objects. It requires more 
       * work to update because we also need to delete all of the 
       * existing desired skills and replace them with the ones listed in
       * this array.
       */

      if (desiredSkills) {
        try {
          desiredSkills = JSON.parse(req.body.desired_skills);

          // Clear old desired skills
          await self.models.TagDesiredSkills.destroy({ where: { job_id: jobId }})

          // Add Desired skills
          var newSkillsArr = desiredSkills.new;
          var idSkillsArr = desiredSkills.ids;
          await self.models.TagDesiredSkills.prototype.handleAddDesiredSkills(newSkillsArr, idSkillsArr, job);
          keysPresent.desired_skills = desiredSkills;
        }

        catch (err) {
          return res.status(400).json({
            message: "Must include 'desired_skills' as btoa encoded string."
          })
        }
      }

      /*
       * Update PAID_JOB_DETAILS
       * Similarly to Desired Skills, this one takes a little bit
       * of work to update as well.
       * This comes in the form of a stringified object. We just need
       * to use it's values and replace what was originally there. No
       * need to delete anything like we do with desired skills.
       */

      if (paidJobDetails) {
        try {
          paidJobDetails = JSON.parse(req.body.paid_job_details);
          job.update({
            paid_job_type: paidJobDetails.paymentChoice,
            paid_job_range_min: paidJobDetails.paymentChoice === "range" ? paidJobDetails.rangeConfig.minValue : null,
            paid_job_range_max: paidJobDetails.paymentChoice === "range" ? paidJobDetails.rangeConfig.maxValue : null,
            paid_job_set_value: paidJobDetails.paymentChoice === "set" ? paidJobDetails.setConfig.value : null,
            paid_job_work_unit: paidJobDetails.paymentChoice === "set" ? paidJobDetails.setConfig.paymentTypeId 
              : paidJobDetails.paymentChoice === "range" 
                ? paidJobDetails.rangeConfig.paymentTypeId
                : null
          }, { 
            where: { 
              job_id: jobId 
            }
          })

          keysPresent.paid_job_details = paidJobDetails;
        }

        catch (err) {
          return res.status(400).json({
            message: "Must include 'paid_job_details' as btoa encoded string."
          })
        }
      }

      await self.models.Event.create({ event_type: 'JOB EDITED', job_id: jobId, employer_id: employer.employer_id })

      return res.status(203).json({ message: "Updated job object", keys: keysPresent })
    }

   /**
    * handleRepostJob
    * API: /api/jobs/:jobId/repost
    * Method: POST
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Edit a job
    */

    async handleRepostJob (req, res) {

      const self = this;

      const userId = req.decoded.userId
      const jobId = req.params.jobId

      let employer;
      let ownsJob;
      let job;
      let questions;
      let newJob;
      let newQuestions;
      let newSlug;

      let keysPresent;
      let desiredSkills = req.body.desired_skills

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }, include: [{ model: self.models.BaseUser, as: 'BaseUser' }]})

        // Ensure that the employer owns this job.
        ownsJob = await employer.hasJob(jobId);

        // If the employer doesn't own this job, bye bye
        if (!ownsJob) return res.status(403).json({ message: "Employer doesn't own this job."});

        // Create a job posting from this job.
        job = await self.models.Job.findOne({ where: { job_id: jobId }});
        newSlug = self.models.Job.prototype.createSlug(job.title);

        newJob = await self.models.Job.create({
          active: true,
          closing_date: job.closing_date,
          compensation: job.compensation,
          employer_id: job.employer_id,
          job_type_id: job.job_type_id,
          location: job.location,
          max_applicants: job.max_applicants,
          num_positions: job.num_positions,
          paid: job.paid,
          paid_job_range_max: job.paid_job_range_max,
          paid_job_range_min: job.paid_job_range_min,
          paid_job_type: job.paid_job_type,
          paid_job_work_unit: job.paid_job_work_unit,
          parent_job_id: job.job_id,
          responsibilities: job.responsibilities,
          remote_work: job.remote_work,
          slug: newSlug,
          title: job.title,
          verified: false
        })

        /**
         * If any questions exist for this job, we need to create those questions as well.
         */

        questions = await job.getQuestions();
        
        questions.forEach(async (q) => {
          await self.models.Question.create({ 
            job_id: newJob.job_id,
            question_type_id: q.question_type_id,
            text: q.text,
            is_premium_question: q.is_premium_question
          })
        })
        

        await self.models.Event.create({ event_type: 'REPOST JOB', job_id: newJob.job_id, employer_id: employer.employer_id })

        return res.status(201).json({
          job: newJob,
          message: "Successfully reposted job."
        })
      }

      catch (err) {
        console.log(err)
        return res.status(500).json({ error: err.toString() })
      }
    }

   /**
    * handleGetApplicantsStatsByJobId
    * API: /api/jobs/:jobId/applicant/stats
    * Method: GET
    * RouteParams: jobId - job id
    * RestrictedTo: Employers
    * Desc: Get number of applicants.
    */

    async handleGetApplicantsStatsByJobId (req, res) {
      const self = this;

      const userId = req.decoded.userId
      const jobId = req.params.jobId

      let ownsJob;

      let employer;

      let applicants;
      let newApplicantsCount;
      let reviewedApplicantsCount;
      let hiredApplicantsCount;

      try {
        employer = await self.models.Employer.findOne({ where: { employer_base_id: userId }, include: [{ model: self.models.BaseUser, as: 'BaseUser' }]})

        // Ensure that the employer owns this job.
        ownsJob = await employer.hasJob(jobId);

        // If the employer doesn't own this job, bye bye
        if (!ownsJob) return res.status(403).json({ message: "Employer doesn't own this job."});

        applicants = await self.models.Applicant.findAll({
          where: {
            job_id: jobId
          }
        })

        newApplicantsCount = applicants.filter((a) => a.state == "INITIAL").length;
        reviewedApplicantsCount = applicants.filter((a) => a.state == "CONTACTED").length;
        hiredApplicantsCount = applicants.filter((a) => a.state == "HIRED").length;

        return res.status(200).json({
          applicants: {
            new: newApplicantsCount,
            review: reviewedApplicantsCount,
            hired: hiredApplicantsCount
          }
        })

      }

      catch (err) {
        return res.status(500).json({ error: err.toString() })
      }
    }
  }

  module.exports = EmployerJobsHandler
