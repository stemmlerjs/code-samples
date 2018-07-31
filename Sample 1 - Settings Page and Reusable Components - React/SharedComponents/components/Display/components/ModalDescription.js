import React from "react";
import PropTypes from "prop-types";

import styles from "../styles/ModalDescription.css";

const ModalDescription = ({ text }) => {
  return <div className={styles.container}>{text}</div>;
};

ModalDescription.propTypes = {
  text: PropTypes.string.isRequired
};

export default ModalDescription;
