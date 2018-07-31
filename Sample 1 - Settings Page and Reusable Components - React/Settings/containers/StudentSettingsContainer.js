import React, { Component } from "react";
import PropTypes from "prop-types";
import createReactClass from "create-react-class";
import { SidebarContainer } from "modules/Main";
import { StudentSettings } from "modules/Settings";
import config from "config";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { operators as accountActionCreators } from "redux/modules/account";

import authRedirectFilter from "config/redirection";
import { pageContainer } from "sharedStyles/sharedContainerStyles.css";
import {
  userProfileAdviceTitle,
  userProfileAdviceTitleAlt,
  userProfileAdviceBody,
  userProfileAdviceBodyAlt,
  cancelBtn,
  badBtn,
  bold,
  boldHeader
} from "sharedStyles/sharedComponentStyles.css";
import pageStyles from "sharedStyles/page.css";

import ChangePasswordModal from "../components/ChangePasswordModal";
import DeactivateAccountModal from "../components/DeactivateAccountModal";
import DeleteAccountModal from "../components/DeleteAccountModal";

import { getJobTypeDetailsArray } from "helpers/jobType";
import { ToastContainer } from "react-toastr";
let container;

class StudentSettingsContainer extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      jobTypeDetails: getJobTypeDetailsArray().sort((a, b) => {
        if (a.description < b.description) return -1;
        if (a.description > b.description) return 1;
        return 0;
      }),
      madeChanges: false,
      changePasswordModal: {
        isOpen: false
      },
      deactivateAccountModal: {
        isOpen: false
      },
      deleteAccountModal: {
        isOpen: false
      }
    };
  }

  componentDidMount = () => {
    this.props.getAccountDetails();
  };

  componentWillMount = () => {
    this.doRedirectionFilter().then(this.props.closeOverlay());
  };

  doRedirectionFilter = () => {
    const config = {
      failureRedirect: {
        student: "/register", // if not logged in, go here (student)
        employer: "/register" // if not logged in, go here (employer)
      },
      restricted: {
        to: "STUDENTS", // STUDENTS only on this route
        redirectTo: "/dashboard/em" // if not an EMPLOYER, redirect to the employer equivalent
        // This might change to employer categories
      }
    };
    return authRedirectFilter(config, this.context.store, this.context.router);
  };

  handleSubmit = () => {
    let newValues = this.props.account.studentSettings;

    this.props.saveAccountChanges(
      newValues,
      onSuccess.bind(this),
      onFailure.bind(this)
    );

    function onSuccess() {
      container.success("Updated your account.", "Cheers.", {
        timeout: 1000
      });

      this.setState({
        ...this.state,
        madeChanges: false
      });
    }

    function onFailure() {
      container.error(
        "Encountered an error updating your account.",
        "Uncool.",
        {
          timeout: 1000
        }
      );
    }
  };

  /**
   * updateValue
   *
   * Upates the local state for this field.
   *
   * @param {String} field name
   * @param {Any} the new value for the field
   * @return void
   */

  updateValue = (fieldName, newValue) => {
    this.reportMadeChanges();
    this.props.updateValue(fieldName, newValue);
  };

  reportMadeChanges = () => {
    this.setState({
      ...this.state,
      madeChanges: true
    });
  };

  handleCancelSave = () => {
    this.setState({
      ...this.state,
      madeChanges: false
    });
  };

  handleOpenModal = modalName => {
    switch (modalName) {
      case "changePasswordModal":
        return this.setState({
          ...this.state,
          changePasswordModal: {
            ...this.state.changePasswordModal,
            isOpen: true
          }
        });
      case "deactivateAccountModal":
        return this.setState({
          ...this.state,
          deactivateAccountModal: {
            ...this.state.deactivateAccountModal,
            isOpen: true
          }
        });
      case "deleteAccountModal":
        return this.setState({
          ...this.state,
          deleteAccountModal: {
            ...this.state.deleteAccountModal,
            isOpen: true
          }
        });
      default:
        return null;
    }
  };

  handleCloseModal = modalName => {
    switch (modalName) {
      case "changePasswordModal":
        return this.setState({
          ...this.state,
          changePasswordModal: {
            ...this.state.changePasswordModal,
            isOpen: false
          }
        });
      case "deactivateAccountModal":
        return this.setState({
          ...this.state,
          deactivateAccountModal: {
            ...this.state.deactivateAccountModal,
            isOpen: false
          }
        });
      case "deleteAccountModal":
        return this.setState({
          ...this.state,
          deleteAccountModal: {
            ...this.state.deleteAccountModal,
            isOpen: false
          }
        });
      default:
        return null;
    }
  };

  render = () => {
    console.log("<StudentSettingsContainer/>", this.props);
    const { account } = this.props;

    const {
      isGettingDetails,
      isGettingDetailsSuccess,
      isGettingDetailsFailure,

      isSaving,
      isSavingSuccess,
      isSavingFailure,

      studentSettings
    } = account;

    return (
      <div className={pageStyles.pageContainer}>
        <SidebarContainer
          isMobile={this.props.isMobile}
          isAStudent={true}
          profilePicture={this.props.profile.photo}
          page={this.props.route.page}
          unreadMessagesCount={this.props.unreadMessagesCount}
        />
        <ChangePasswordModal
          isOpen={this.state.changePasswordModal.isOpen}
          onClose={() => this.handleCloseModal("changePasswordModal")}
          email={this.props.email}
        />
        <DeactivateAccountModal
          isOpen={this.state.deactivateAccountModal.isOpen}
          onClose={() => this.handleCloseModal("deactivateAccountModal")}
        />
        <DeleteAccountModal
          isOpen={this.state.deleteAccountModal.isOpen}
          onClose={() => this.handleCloseModal("deleteAccountModal")}
        />
        <StudentSettings
          handleConfirmDeactivateAccount={this.confirmDeactivateAccount}
          isGettingDetails={isGettingDetails}
          isGettingDetailsSuccess={isGettingDetailsSuccess}
          isGettingDetailsFailure={isGettingDetailsFailure}
          isSaving={isSaving}
          isSavingSuccess={isSavingSuccess}
          isSavingFailure={isSavingFailure}
          account={this.props.account}
          updateValue={this.updateValue}
          madeChanges={this.state.madeChanges}
          handleSubmit={this.handleSubmit}
          handleCancelSave={this.handleCancelSave}
          settingsComponents={[
            {
              title: "Your email",
              description: `Which email should we (and employers) use to communicate with you?`,
              icon: "fa-envelope",
              data: [
                {
                  type: "email",
                  value: studentSettings.preferredEmail,
                  name: "preferredEmail"
                }
              ]
            },
            {
              title: "Job search status",
              description: `What's your current job search status? Still need a job?`,
              icon: "fa-send",
              data: [
                {
                  type: "dropdown",
                  value: studentSettings.jobSearchStatus,
                  name: "jobSearchStatus",
                  list: [
                    { id: 1, name: "Actively looking for work" },
                    {
                      id: 2,
                      name:
                        "Just checking it out, open to work on the right gig"
                    },
                    { id: 3, name: "Not looking for work right now" }
                  ],
                  valueField: "id",
                  textField: "name"
                }
              ]
            },
            {
              title: "Preferred job types",
              description: `We'll use this to match you up with jobs you're most interested in.`,
              icon: "fa-briefcase",
              data: [
                {
                  type: "checkboxes",
                  groups: [
                    {
                      value: studentSettings.preferredJobTypes,
                      name: "preferredJobTypes",
                      items: this.state.jobTypeDetails,
                      allCheckboxEnabled: true,
                      allCheckboxText: "Any",
                      valueField: "job_type_id",
                      textField: "description"
                    }
                  ]
                }
              ]
            },
            {
              title: "Preferred job location",
              description: "Where's the main location you'd like to get a job?",
              icon: "fa fa-location-arrow",
              data: [
                {
                  type: "email",
                  value: studentSettings.preferredJobLocation,
                  name: "preferredJobLocation"
                }
              ]
            },
            {
              title: "Notifications",
              description: `When and what would you like to be alerted about?`,
              icon: "fa-bell",
              data: [
                {
                  type: "checkboxes",
                  groups: [
                    {
                      title: "New job notifications",
                      value: studentSettings.jobNotifications,
                      name: "jobNotifications",
                      items: [
                        { name: "Everytime a new job is posted", id: 1 },
                        { name: "Once a day", id: 2 },
                        { name: "Once a week", id: 3 },
                        { name: "None", id: 4 }
                      ],
                      valueField: "id",
                      textField: "name",
                      singleSelection: true
                    },
                    {
                      title: "App notifications",
                      value: studentSettings.appNotifications,
                      name: "appNotifications",
                      items: [
                        { name: "When your job app status changes", id: 1 },
                        { name: "When an employer sends you a message", id: 2 }
                      ],
                      valueField: "id",
                      textField: "name",
                      noneCheckboxEnabled: true,
                      noneCheckboxText: "Don't send me any notifications"
                    }
                  ]
                }
              ]
            },
            {
              title: "Password",
              description: `Change your password here.`,
              icon: "fa-lock",
              data: [
                {
                  type: "button",
                  text: "Change password",
                  buttonType: "normal-clear",
                  onClick: () => this.handleOpenModal("changePasswordModal")
                }
              ]
            },
            {
              title: "Danger zone",
              description: `Delete and deactive your account options.`,
              icon: "fa-times",
              danger: true,
              data: [
                {
                  type: "button",
                  text: "Deativate account",
                  buttonType: "danger-clear",
                  onClick: () => this.handleOpenModal("deactivateAccountModal")
                },
                {
                  type: "button",
                  text: "Delete account",
                  buttonType: "danger-bold",
                  onClick: () => this.handleOpenModal("deleteAccountModal")
                }
              ]
            }
          ]}
        />

        <ToastContainer
          ref={ref => (container = ref)}
          className="toast-top-right"
          data-cy="account-toaster"
        />
      </div>
    );
  };
}

/* The entire redux store is passed in here,
// Return an object defining which values you want to bind to props
//
// @params ({user}) contains BaseUser & Employer attributes
// */

function mapStateToProps({ user, profile, account }) {
  return {
    profile: profile.studentProfile ? profile.studentProfile : {},
    account: account ? account : {},
    email: user ? user.email : ""
  };
}

function mapActionCreatorsToProps(dispatch) {
  return bindActionCreators(
    {
      ...accountActionCreators
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapActionCreatorsToProps)(
  StudentSettingsContainer
);
