import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/DeactivateAccountModal.css";
import {
  ErrorMessage,
  Loading
} from "modules/SharedComponents/components/Display";
import {
  TextInput,
  Checkboxes,
  TextAreaInput
} from "modules/SharedComponents/components/Inputs";

const feedbackReasons = [
  { name: "I found work through Univjobs", id: 1 },
  { name: "I found work elsewhere", id: 2 },
  { name: "Not enough jobs I'm interested in", id: 3 },
  { name: "Other", id: 4 }
];

const Feedback = props => {
  return (
    <div className={styles.innerModalContainer}>
      <h1>{props.title}</h1>
      <div style={{ marginTop: "1em" }}>{props.subTitle}</div>
      <Checkboxes
        groups={[
          {
            value: [],
            name: "reasons",
            items: feedbackReasons,
            valueField: "id",
            textField: "name",
            singleSelection: true
          }
        ]}
        onChange={(group, newValue) =>
          props.updateFeedbackForm("checkboxes", newValue)
        }
      />
      <TextAreaInput
        title={"Comments"}
        maxCharacters={400}
        onChange={e => props.updateFeedbackForm("comments", e.target.value)}
        value={props.comments}
      />
      {props.isSubmitting ? <Loading /> : ""}
      <ErrorMessage text={props.errorMessage} />
    </div>
  );
};

Feedback.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  updateFeedbackForm: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired
};

export default Feedback;
