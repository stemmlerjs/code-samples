"use strict"

const Op = require('sequelize').Op;
const sequelize = require('sequelize');

 /*
  * app/routes/jobs/studentJobHandler.js
  *
  * @Class StudentJobHandler
  * This class is meant to handle all of the requests that are
  * intended for Student related job functions at the REST API endpoint
  * /api/jobs/*. 
  *
  * @see app/routes/jobs/router.js
  */

  class StudentJobHandler {

   /*
    * @param (Obj) requestHelpers - functions for requests
    * @param (Obj) StudentModel
    * @param (Obj) JobModel
    */

    constructor(requestHelpers, StudentModel, JobModel, QuestionModel, PinnedJobsModel, ApplicantModel, Mailer, models) {
      this.reqHelper = requestHelpers
      this.Student = StudentModel
      this.Job = JobModel
      this.Question = QuestionModel
      this.PinnedJobs = PinnedJobsModel
      this.Applicant = ApplicantModel
      this.Mailer = Mailer
      this.models = models
    }

   /*
    * handleGetAllJobs
    * API: /api/job
    * Method: GET
    * Desc: Returns all of the jobs and all of the questions 
    * currently in the app.
    */

    async handleGetAllJobs (req, res) {

      /*
       * TODO: We need to do pagination with this pretty soon.
       * But as for now, we're OK.
       */

      const self = this;
      const sequelize = self.models.sequelize;

      let userId = req.decoded.userId;
      let studentId;

      let student;
      let jobs;

      let appliedAttrColumnQuery;
      let pinnedAttrColumnQuery;
      let invitedAttrColumnQuery;

      try {
        jobs = await self.models.Job.findAll({
          where: {
            active: true,
            verified: true
          },
          order: [
            ['created_at', 'DESC']
          ]
        });

        return res.status(200).json({
          jobs: jobs
        })
      }

      catch (err) {
        console.log(err)
        return res.status(500).json({
          error: err.toString()
        })
      }

    }

   /*
    * handleApplyToJob
    * API: /api/jobs/:jobId/apply
    * Method: POST
    * Desc: Apply to a job!
    * Headers: 'application/json'
    * RouteParams: jobId (the job id)
    * Body Params: 
    *   
    */

    async handleApplyToJob (req, res) {

      const self = this;
      const RequestHelper = this.reqHelper
      const Mailer = this.Mailer;

      const jobId = req.params.jobId

      const userId = req.decoded.userId
      let answers = req.body.answers;

      let student;
      let studentId;
      let applicant;
      let job;
      let jobApplicants;
      let questions;

      try {
        // Decode the answers array
        answers = JSON.parse(answers)

        // Get student
        student = await self.models.Student.findOne({ 
          where: { 
            student_base_id: userId 
          }, 
          include: [{ 
            model: self.models.BaseUser,
            as: 'BaseUser'
          }]
        })

        studentId = student.student_id;

        // Don't continue if student's profile isnt complete
        if (!student.BaseUser.is_profile_complete) return res.status(403).json({ message: "Must complete profile before applying to jobs." });

        // Check if student applied to job already
        applicant = await self.models.Applicant.findOne({ where: { job_id: jobId, student_id: studentId }});

        if (applicant) return res.status(409).json({ message: "You already applied to this job." });

        // Otherwise, keep it goin', apply to the job if the job hasn't exceeded max applicants.
        job = await self.models.Job.findOne({ where: { job_id: jobId }});
        jobApplicants = await job.getApplicants();

        if (jobApplicants.length >= job.max_applicants) {
          return res.status(400).json({
            message: "Max applicants for this job reached"
          })
        }

        // If this job has questions, ensure that the user has supplied the total number of
        // required questions and that the ids match for which question they're answering.
        questions = await job.getQuestions();

        await RequestHelper.ensureAnswersProvided(answers, questions);

        // Apply to job
        applicant = await self.models.Applicant.create({ job_id: jobId, student_id: studentId })

        // Submit the answers if there are any.
        if (answers.length != 0) {
          for(let i = 0; i < answers.length; i++) {
            await self.models.Answer.create({ 
              job_id: jobId, 
              student_id: studentId, 
              question_id: answers[i].question_id, 
              text: answers[i].text, 
              applicant_id: applicant.applicant_id
            })
          }
        }

        await self.models.Event.create({ 
          event_type: 'NEW APPLICANT', 
          applicant_id: applicant.applicant_id, 
          job_id: job.job_id, 
          employer_id: job.employer_id,
          student_id: studentId
        })

        Mailer.newApplicantEmail(jobId, studentId, userId)
        
        return res.status(201).json({
          message: "Successfully applied to job."
        })
        
      }

      catch (err) {
        return res.status(400).json({ error: err.toString() })
      }
    }

   /*
    * handleGetAllJobsAppliedTo
    * API: /api/jobs/applied
    * Method: GET
    * RestrictedTo: Students
    * Desc: Get all jobs that the student has applied to.
    */

    async handleGetAllJobsAppliedTo (req, res) {

      const userId = req.decoded.userId;
      const self = this;
      
      let jobs;
      let student;
      let studentId;
      
      try {
        student = await self.models.Student.findOne({ where: { student_base_id: userId }});
        studentId = student.student_id;

        const applied = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM applicant A where A.student_id = ${student.student_id})`)
        const pinned = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM pinned_job A where A.student_id = ${student.student_id})`)
        const invited = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM invite A where A.student_id = ${student.student_id})`)

        jobs = await self.models.Job.findAll({
          include: [
            { model: self.models.Applicant, as: 'Applicants', where: { student_id: studentId }, required: true }, 
            { model: self.models.Question, as: 'Questions' }, 
            { model: self.models.Answer, as: 'Answers' }, 
            { model: self.models.Employer, as: 'Employer', 
              include: [
                { model: self.models.ListsIndustries, as: 'industry' },
                { model: self.models.ListsEmployeeCountTypes, as: 'EmployeeCount'}
              ]
            }
          ],
          attributes: Object.keys(self.models.Job.attributes).concat([
            [applied, 'applied'],
            [pinned, 'pinned'],
            [invited, 'invited']
          ]),
          order: [  
            [ { model: self.models.Applicant, as: 'Applicants' }, 'date_applied', 'DESC']
          ],
        })

        res.status(200).json({
          jobs: jobs
        })
      }

      catch (err) {
        console.log(err)
        return res.status(400).json({ error: err.toString() })
      }
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

    async handleGetJobById (req, res) {

      const jobId = req.params.jobId; 
      const self = this;

      const userId = req.decoded.userId

      let job;

      let student;
      let studentId;

      try {

        student = await self.models.Student.findOne({ where: { student_base_id: userId }})
        studentId = student.student_id;

        const applied = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM applicant A where A.student_id = ${student.student_id})`)
        const pinned = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM pinned_job A where A.student_id = ${student.student_id})`)
        const invited = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM invite A where A.student_id = ${student.student_id})`)

        job = await self.models.Job.findOne({
          attributes: Object.keys(self.models.Job.attributes).concat([
            [applied, 'applied'],
            [pinned, 'pinned'],
            [invited, 'invited']
          ]),
          where: {
            job_id: jobId
          },
          include: [
            { model: self.models.Applicant, as: 'Applicants', where: { student_id: studentId }, required: false }, 
            { model: self.models.Answer, as: 'Answers', where: { student_id: studentId }, required: false // forces a LEFT JOIN instead of an INNER JOIN 
              }, 
            { model: self.models.ListsSkills, as: "DesiredSkills" },
            { model: self.models.Employer, as: 'Employer',
              include: [
                { model: self.models.ListsIndustries, as: 'industry' },
                { model: self.models.ListsEmployeeCountTypes, as: 'EmployeeCount' }
              ]
            },
            { model: self.models.Question, as: 'Questions' }, 
            { model: self.models.PinnedJob, as: 'PinnedJob', }, 
            { model: self.models.ListsJobTypes, as: 'JobType' }, 
          ]
        })

        return res.json({
          job: job
        })
      }

      catch (err) {
        console.log(err)
        return res.status(400).json({ error: err.toString() })
      }
    }

    handlePinAJob (req, res) {

      var _reqHelper = this.reqHelper
      var _PinnedJobs = this.PinnedJobs
      var userId = req.decoded.userId
      var jobId = req.params.jobId 

      _reqHelper.getStudentId(userId)

        .then((studentId) => {

         /*
          * Now pin the job
          */

          _PinnedJobs.methods.pinJob(studentId, jobId)

            .then(() => {

              res.status(201).json({
                message: "Successfully pinned job " + jobId + ".",
                jobId: jobId
              })

            })

            .catch((err) => {

              res.status(500).json({
                error: err.toString()
              })

            })

        })

        .catch((err) => {

          res.status(403).json({
            message: 'Unauthorized'
          })

        })

    }

    handleUnpinAJob (req, res) {

      var _reqHelper = this.reqHelper
      var _PinnedJobs = this.PinnedJobs
      var userId = req.decoded.userId
      var jobId = req.params.jobId 

      _reqHelper.getStudentId(userId)

        .then((studentId) => {

         /*
          * Now pin the job
          */

          _PinnedJobs.methods.unpinJob(studentId, jobId)

            .then(() => {

              res.status(201).json({
                message: "Successfully unpinned job " + jobId + ".",
                jobId: jobId
              })

            })

            .catch((err) => {

              res.status(500).json({
                error: err.toString()
              })

            })

        })

        .catch((err) => {

          res.status(403).json({
            message: 'Unauthorized'
          })

        })
    }

    /**
     * handleSearchJobs
     * API: /api/jobs/search
     * Method: POST
     * RestrictedTo: Students
     * Desc: Get jobs
     * 
     * @param {Number} page
     * 
     * */

    async handleSearchJobs (req, res) {
      const self = this;
      
      let userId = req.decoded.userId;
      let { page, query, order } = req.body

      query = JSON.parse(query);

      let jobs;
      let limit = 15;                  // number of records per page
      let offset = page * limit;
      let pages;

      let student = await self.models.Student.findOne({ where: { student_base_id: userId }});
      const applied = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM applicant A where A.student_id = ${student.student_id})`)
      const pinned = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM pinned_job A where A.student_id = ${student.student_id})`)
      const invited = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM invite A where A.student_id = ${student.student_id})`)

      let sqlQuery = {
        limit: limit,
        offset: offset,
        include: [
          { 
            model: self.models.Employer, as: 'Employer',
            include: [
              { model: self.models.ListsIndustries, as: 'industry' },
              { model: self.models.ListsEmployeeCountTypes, as: 'EmployeeCount'}
            ]
          },
          { model: self.models.ListsSkills, as: "DesiredSkills", required: false },
          { model: self.models.Question, as: 'Questions' },
          { model: self.models.ListsJobTypes, as: 'JobType' }
        ],
        where: [
          { active: true },
          { verified: true }
        ],
        order: [
          
        ],
        attributes: Object.keys(self.models.Job.attributes)
        .concat([
          [applied, 'applied'],
          [pinned, 'pinned'],
          [invited, 'invited']
        ])
        // subQuery:false
      }

      /**
       * If we have items to add to our search query, we 
       * need to start formatting them and place them in our
       * db.
       */

      if (Object.keys(query).length !== 0) {

        let jobTypes    = query.jobTypes;
        let remote      = query.remote;
        let industries  = query.industries; 
        let keyword     = query.keyword;
        let location    = query.location;
        
        sqlQuery = addJobTypesToQuery(sqlQuery, jobTypes);
        sqlQuery = addRemoteToQuery(sqlQuery, remote);
        sqlQuery = addIndustriesToQuery(sqlQuery, industries)
        sqlQuery = addFullTextSearchToQuery(sqlQuery, keyword);
        sqlQuery = addLocationFullTextSearchToQuery(sqlQuery, location);
        
      }

      /**
       * Set the ordering
       */

      if (order) {
        switch (Number(order)) {
          // Most relevant (if set, comes after title_relevance)
          case 1:
            sqlQuery.order.push(['created_at', 'DESC'])
            break;
          // Most recent
          case 2:
            sqlQuery.order.push(['created_at', 'DESC'])
            break;
          // Date closing (soonest)
          case 3:
            sqlQuery.order.push(['closing_date', 'DESC'])
            break;
          // Date closing (latest)
          case 4:
            sqlQuery.order.push(['closing_date', 'ASC'])
            break;
          default: 
            sqlQuery.order.push(['created_at', 'DESC'])
            break;
        }
      }

      else {
        sqlQuery.order.push(['created_at', 'DESC'])
      }

      /**
       * Perform the query.
       */

      try {
        // Find the count of jobs and also get the page of 20 jobs.
        jobs = await self.models.Job.findAndCountAll(sqlQuery)

        pages = Math.ceil(jobs.count / limit);
        offset = limit * (page - 1);

        return res.status(200).json({'jobs': jobs.rows, 'count': jobs.count, 'pages': pages});
      }

      catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
      }
    }

   /**
    * handleGetAllJobsInvitedTo
    * API: /api/jobs/invited
    * Method: GET
    * RestrictedTo: Students
    * Desc: Get jobs invited to
    */

    async handleGetAllJobsInvitedTo (req, res) {
      const userId = req.decoded.userId;
      const self = this;
      
      let jobs;
      let student;
      let studentId;
      
      try {
        student = await self.models.Student.findOne({ where: { student_base_id: userId }});
        studentId = student.student_id;

        console.log('studentid', studentId)

        const applied = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM applicant A where A.student_id = ${student.student_id})`)
        const pinned = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM pinned_job A where A.student_id = ${student.student_id})`)
        const invited = sequelize.literal(`job.job_id IN (SELECT A.job_id FROM invite A where A.student_id = ${student.student_id})`)

        jobs = await self.models.Job.findAll({
          include: [
            { model: self.models.Applicant, as: 'Applicants', where: { student_id: studentId }, required: false }, 
            { model: self.models.Question, as: 'Questions' }, 
            { model: self.models.Answer, as: 'Answers' }, 
            { model: self.models.Employer, as: 'Employer', 
              include: [
                { model: self.models.ListsIndustries, as: 'industry' },
                { model: self.models.ListsEmployeeCountTypes, as: 'EmployeeCount'}
              ]
            },
            { model: self.models.Invite, as: 'Invites', where: { student_id: studentId }, required: true }, 
            { model: self.models.ListsJobTypes, as: 'JobType' }
          ],
          attributes: Object.keys(self.models.Job.attributes)
          .concat([
            [applied, 'applied'],
            [pinned, 'pinned'],
            [invited, 'invited']
          ])
        })

        return res.status(200).json({
          jobs: jobs
        })
      }

      catch (err) {
        console.log(err)
        return res.status(400).json({ error: err.toString() })
      }
    }
  }

  function addIndustriesToQuery (sqlQuery, industries) {
    industries = isPopulatedArray(industries);
    if (industries) {
      sqlQuery.include[0].include[0].where = [];
      sqlQuery.include[0].include[0].where.push({ 
        'industry_id': {
          [Op.or]: industries
        } 
      }) 
    }
    return sqlQuery;
  }

  function addLocationFullTextSearchToQuery (sqlQuery, location) {
    if (!!location == true) {
      sqlQuery.where.push( sequelize.literal(`MATCH (location) AGAINST(:location IN NATURAL LANGUAGE MODE)`) )

      if (!sqlQuery.hasOwnProperty('replacements')) sqlQuery.replacements = {};

      sqlQuery.replacements = Object.assign(sqlQuery.replacements, {
        location: location
      })
    }

    return sqlQuery;
  }

  function addFullTextSearchToQuery (sqlQuery, keyword) {
    if (!!keyword == true) {
      sqlQuery.where.push( 
        sequelize.literal("MATCH (title, responsibilities, qualification, job.company_name) AGAINST(:keyword IN NATURAL LANGUAGE MODE) OR :desired LIKE '%"+keyword+ "%'") 
      )
      
      if (!sqlQuery.hasOwnProperty('replacements')) sqlQuery.replacements = {};

      sqlQuery.replacements = Object.assign(sqlQuery.replacements, {
        keyword: keyword,
        desired: "`DesiredSkills`.`name`"
      })

      // Include title relevance
      sqlQuery.attributes.push([sequelize.literal("MATCH (title) AGAINST (:keyword)"), 'title_relevance'])

      // Also, sort by title relevance
      sqlQuery.order.unshift([sequelize.literal("title_relevance"), 'DESC'])
    }

    return sqlQuery;
  }

  function addRemoteToQuery (sqlQuery, remote) {
    if (!!remote == true) {
      if (remote == true) {
        sqlQuery.where.push({ remote_work: true })
      }    
    }

    return sqlQuery;
  }

  function addJobTypesToQuery (sqlQuery, jobTypes) {
    jobTypes = isPopulatedArray(jobTypes);
    if (jobTypes) {
      sqlQuery.where.push({ 
        job_type_id: {
          [Op.or]: jobTypes
        } 
      }) 
    }

    return sqlQuery;
  }

  /**
   * isPopulatedArray
   * 
   * Creates the or block for job types.
   * 
   * @param {}
   */

  function isPopulatedArray (array) {
    
    /**
     * If the object supplied wasn't an array, or it's
     * undefined, then we will return null right away.
     */

    if (!Array.isArray(array)) {
      return null;
    }

    /**
     * If there were no query objects to
     * add, we'll just return null;
     */

    if (array.length == 0) {
      return null;
    }

    return array;
  }

  module.exports = StudentJobHandler
