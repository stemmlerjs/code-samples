import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/PageTitle.css";

const PageTitle = ({ text, overrideStyles }) => {
  return (
    <div style={overrideStyles} className={styles.pageTitle}>
      {text}
    </div>
  );
};

export default PageTitle;
