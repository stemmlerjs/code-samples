
const path = require('path')
const Email = require('email-templates');
const email = new Email({
  views: { root: path.resolve('app/mailer/templater') }
});

const templater = {
  job: {
    getJobVerifiedEmail: (employerName, jobTitle, link) => {
      return email.render('mars/job-verified', { employerName: employerName, jobTitle: jobTitle, link: link })
    },
    getJobRejectedEmail: (employerName, jobTitle) => {
      return email.render('mars/job-rejected', { employerName: employerName, jobTitle: jobTitle })
    },
    getManuallyClosedByEmployerEmail: (studentName, jobTitle, companyName) => {
      return email.render('mars/job-manually-closed-by-employer', { studentName: studentName, jobTitle: jobTitle, companyName: companyName })
    },
    getJobClosedEmployerNotificationEmail: (employerName, jobTitle) => {
      return email.render('mars/job-closed-employer-notification', { employerName: employerName, jobTitle: jobTitle })
    },
    getStudentAppliedToJobEmail: (employerName, jobTitle, studentName, link) => {
      return email.render('mars/student-applied-notification', { employerName: employerName, jobTitle: jobTitle, studentName: studentName, link: link })
    },
    getEmployerBeganReviewingEmail: (studentName, companyName, jobTitle, link) => {
      return email.render('mars/employer-reviewed-applicant', { studentName: studentName, companyName: companyName, jobTitle: jobTitle, link: link })
    },
    getInvitationEmail: (studentName, jobTitle, companyName, link) => {
      return email.render('mars/job-invitation', { studentName: studentName, companyName: companyName, jobTitle: jobTitle, link: link })
    },
    getHiredEmail: (studentName, positionName, companyName) => {
      return email.render('mars/hired-email', { studentName: studentName, companyName: companyName, positionName: positionName })
    },
    getNotHiredEmail: (studentName, positionName, companyName) => {
      return email.render('mars/student-not-hired', { studentName: studentName, companyName: companyName, positionName: positionName })
    }
  },
  registration: {
    getEmailVerificationEmail: (verificationLink) => {
      return email.render('mars/email-verification', { verificationLink: verificationLink })
    },
    getPasswordResetEmail: (resetLink) => {
      return email.render('mars/password-reset', { resetLink: resetLink })
    }
  }
}

module.exports = templater