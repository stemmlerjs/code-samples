import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/SaveHeader.css";

export default class SaveHeader extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { visible, handleSubmit, handleCancel } = this.props;

    return (
      <div
        className={
          visible
            ? `${styles.container} ${styles.visible}`
            : `${styles.container} ${styles.invisible}`
        }
      >
        <div onClick={handleSubmit} className={styles.button}>
          Save
        </div>
        <div onClick={handleCancel} className={styles.button}>
          Cancel
        </div>
      </div>
    );
  }
}
