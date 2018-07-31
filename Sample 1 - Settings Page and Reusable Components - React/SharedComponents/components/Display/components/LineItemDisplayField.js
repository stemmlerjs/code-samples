import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/LineItemDisplayField.css";

const LineItemDisplayField = props => {
  return (
    <div className={styles.lineItemContainer}>
      <div className={styles.lineItemContainerTitle}>{props.title}</div>
      {!!props.value ? (
        <div className={styles.lineItemContainerText}>{props.value}</div>
      ) : (
        <div className={styles.lineItemContainerText}>{props.placeholder}</div>
      )}
    </div>
  );
};

LineItemDisplayField.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string.isRequired
};

export default LineItemDisplayField;
