"use strict"

class AccountHandler {

  constructor(models, reqHelper, Crypto, Redis) {
    this.models = models;
    this.requestHelper = reqHelper;
    this.Crypto = Crypto;
    this.Redis = Redis;

    this.studentPreferencesColumns = [
      'preference_preferred_email', 
      'email_pref_id',
      'preference_job_search_status_id',
      'preferred_job_location'
    ]
  }

  /*
  * handleGetAccountDetails
  * API: /
  * Method: GET
  * Desc: Get account details
  */

  async handleGetAccountDetails (req, res) {

    const self = this;

    const userId = req.decoded.userId;
    const isAStudent = req.decoded.isAStudent;

    let student;

    try {
      student = await self.models.Student.findOne({ 
        attributes: self.studentPreferencesColumns,
        where: { 
          student_base_id: userId 
        },
        include: [
          { model: self.models.ListsEmailPrefs, as: 'EmailPrefs' },
          { model: self.models.ListsJobSearchStatuses, as: 'JobSearchStatus' },
          { model: self.models.ListsJobTypes, as: 'PreferredJobTypes' },
          { model: self.models.ListsAppNotificationTypes, as: 'AppNotifications' }
        ]
      })

      return res.status(200).json({
        account: student
      })
    }

    catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.toString() })
    }
  }

 /*
  * handleUpdateAccountDetails
  * API: /
  * Method: POST
  * Desc: Update account details
  */

  async handleUpdateAccountDetails (req, res) {
    const self = this;
    const userId = req.decoded.userId;
    const isAStudent = req.decoded.isAStudent;

    let student;
    let studentId;

    const emailPrefId                = req.body.email_pref_id;
    const jobSearchStatus            = req.body.preference_job_search_status_id;
    const preferredEmail             = req.body.preference_preferred_email;
    let tagAppNotifications          = req.body.app_notifications;
    let tagPreferredJobTypes         = req.body.preferred_job_types;
    let preferredJobLocation         = req.body.preferred_job_location;

    try {
      student = await self.models.Student.findOne({ where: { student_base_id: userId }});
      studentId = student.student_id;
      
      // Update student columns
      await student.update({
        email_pref_id: emailPrefId,
        preference_job_search_status_id: jobSearchStatus,
        preference_preferred_email: preferredEmail,
        preferred_job_location: preferredJobLocation
      })

      // Update tags
      if (!!tagPreferredJobTypes) {
        tagPreferredJobTypes = JSON.parse(tagPreferredJobTypes);
        tagPreferredJobTypes = await self.models.TagsStudentPreferredJobTypes.prototype.handleSetPreferredJobTypes(tagPreferredJobTypes, studentId)
      }

      if (!!tagAppNotifications) {
        tagAppNotifications = JSON.parse(tagAppNotifications);
        tagAppNotifications = await self.models.TagStudentAppNotifications.prototype.handleSetStudentAppNotifications(tagAppNotifications, studentId)
      }
    }

    catch (err) {
      console.log(err);
      return res.status(500).json({
        error: err.toString()
      })
    }

    return res.status(200).json({
      message: 'mhm'
    })
  }

   /*
  * handleGeneratePasswordResetCode
  * API: /api/account/password/code/generate
  * Method: POST
  * Body: email
  * Desc: Creates a new password reset for this user and sends it
  * back to them.
  *
  */

  async handleGeneratePasswordResetCode (req, res) {
    const self = this;
    const userId = req.decoded.userId
    const password = req.body.password;

    let baseUser;
    let code;
    let email;

    try {
      baseUser = await self.models.BaseUser.findOne({ where: { user_id: userId }});
      email = baseUser.user_email;

      try {
        // Verify that the password is correct.
        await self.models.BaseUser.prototype.checkPassword(email, password)
      }

      catch (err) {
        return res.status(400).json({ message: 'Password doesnt match.' })
      }

      self.Crypto.randomBytes(20, (err, buf) => {
        if (err) return res.status(500).json({err: err.toString() })
        code = buf.toString('hex');
        self.Redis.addPasswordResetCode(email, code);
        return res.status(200).json({ code: code });
      })
    }

    catch (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Could not generate a password reset code'
      })
    }
  }

  /*
  * handleDeactivateAccount
  * API: /api/account/deactivate
  * Method: POST
  * Desc: Deactivates the user's account.
  */

  async handleDeactivateAccount (req, res) {
    const self = this;
    const userId = req.decoded.userId;

    let comments = req.body.comments;
    let reasons = req.body.reasons;

    let message = `Reason: ${reasons}, Comments: ${comments}`

    let student;
    let baseUser;

    try {
      baseUser = await self.models.BaseUser.findOne({ where: { user_id: userId }});
      student = await self.models.Student.findOne({ where: { student_base_id: userId }})

      // Deactivate your account
      await baseUser.update({
        is_active: false
      })

      // Also, remove the user from redis
      await self.Redis.delJWT(baseUser.user_email);

      // Leave feedback
      await self.models.Feedback.create({ feedback_type: 'DEACTIVATE_ACCOUNT', user_id: baseUser.user_id, message: message });

      // Also, we should probably clean everything up
      // ..
      // ..
      // ..

      return res.status(200).json({
        message: 'Successfully deactivated your account'
      })
    }

    catch (err) {
      console.log(err);
      return res.status(500).json({
        message: 'Could not deactivate account'
      })
    }
  }

  async handleDeleteAccount (req, res) {
    const self = this;
    const userId = req.decoded.userId;

    let comments = req.body.comments;
    let reasons = req.body.reasons;

    let message = `Reason: ${reasons}, Comments: ${comments}`

    let baseUser;

    try {
      // Get user
      baseUser = await self.models.BaseUser.findOne({ where: { user_id: userId }})

      // Set deleted
      await baseUser.update({
        is_deleted: true,
        user_email: 'deleted@deleted.com'
      });

      // Remove token from Redis
      await self.Redis.delJWT(baseUser.user_email);

      // Leave feedback
      await self.models.Feedback.create({ feedback_type: 'DELETE_ACCOUNT', user_id: baseUser.user_id, message: message });

      return res.status(200).json({ message: "Successfully deleted account" })
    }

    catch (err) {
      console.log(err);
      return res.status(500).json({ message: err.toString() })
    }
  }
}

module.exports = AccountHandler

