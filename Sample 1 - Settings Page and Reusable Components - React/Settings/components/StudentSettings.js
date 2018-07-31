import React from "react";
import PropTypes from "prop-types";
import ReactTooltip from "react-tooltip";
import { PageTitle } from "modules/SharedComponents/components/Display";
import SaveHeader from "./SaveHeader";
import config from "config";
import moment from "moment";

// ================CSS IMPORTS============================== //
/*NOTE: styles/StudentDashboard.css can be reused */
import {
  rootComponentContainer,
  margins,
  title
} from "sharedStyles/sharedComponentStyles.css";
import { buttonContainers } from "sharedStyles/widgets.css";
import {
  cardSettingsContainer,
  flexibleCardContainer,
  flexRowItem,
  settingsOptionHeader,
  settingsOptionDetail,
  textButton
} from "modules/SharedComponents/styles/Settings.css";
import get from "lodash/get";

import Setting from "./Setting";

import { ClipLoader } from "react-spinners";

const Loading = () => {
  return (
    <div style={{ margin: "0 auto" }}>
      <ClipLoader color={"#53a7d8"} loading={true} />
    </div>
  );
};

export default class StudentSettings extends React.Component {
  static contextTypes = {
    router: PropTypes.object.isRequired,
    store: PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }

  render() {
    const {
      id,
      isChecked,
      onClickedButton,
      handleConfirmDeactivateAccount,
      account,

      isGettingDetails,
      isGettingDetailsSuccess,
      isGettingDetailsFailure,

      isSaving,
      isSavingSuccess,
      isSavingFailure
    } = this.props;

    return (
      <div className={rootComponentContainer}>
        <SaveHeader
          visible={this.props.madeChanges}
          handleSubmit={this.props.handleSubmit}
          handleCancel={this.props.handleCancelSave}
        />
        <PageTitle
          text="Settings"
          overrideStyles={this.props.madeChanges ? { marginTop: "60px" } : {}}
        />

        {isGettingDetails ? (
          <Loading />
        ) : isGettingDetailsFailure ? (
          <div>Couldn't load account settings. Please try again later.</div>
        ) : isGettingDetailsSuccess ? (
          <div className={flexibleCardContainer}>
            {this.props.settingsComponents.map(component => (
              <Setting
                title={component.title}
                description={component.description}
                icon={component.icon}
                danger={component.danger}
                data={component.data}
                getValue={this.getValue}
                updateValue={this.props.updateValue}
              />
            ))}
          </div>
        ) : (
          ""
        )}
      </div>
    );
  }
}

StudentSettings.propTypes = {};
