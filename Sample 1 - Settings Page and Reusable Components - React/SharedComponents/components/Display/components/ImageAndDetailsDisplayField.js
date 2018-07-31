import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/ImageAndDetailsDisplayField.css";
import ClearbitLogo from "./ClearbitLogo";

export default class ImageAndDetailsDisplayField extends React.Component {
  static defaultProps = {
    editable: false
  };

  constructor(props) {
    super(props);
  }

  render() {
    const props = this.props;
    // console.log('<ImageAndDetailsDisplayField/>', props)
    return (
      <div
        onClick={props.onClick ? props.onClick : null}
        className={
          props.removeBottomBorder
            ? styles.schoolHeaderContainerNoBorder
            : styles.schoolHeaderContainer
        }
      >
        <div className={styles.imageContainer}>
          <ClearbitLogo companyName={props.companyName} />
        </div>
        <div className={styles.schoolHeaderTextContainer}>
          {props.lineOne ? (
            <div className={styles.schoolHeaderSchoolName}>
              {props.lineOne}
              {props.editable ? (
                <i className={`fa fa-pencil ${styles.editButton}`} />
              ) : (
                ""
              )}
            </div>
          ) : (
            ""
          )}
          {props.lineTwo ? (
            <div className={styles.schoolHeaderContainerCurrentYear}>
              {props.lineTwo}
            </div>
          ) : (
            ""
          )}
          {props.lineThree ? (
            <div className={styles.schoolHeaderGradDate}>{props.lineThree}</div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }
}

ImageAndDetailsDisplayField.propTypes = {
  lineOne: PropTypes.string.isRequired,
  lineTwo: PropTypes.string.isRequired,
  lineThree: PropTypes.string.isRequired,
  image: PropTypes.string,
  companyName: PropTypes.string,
  removeBottomBorder: PropTypes.bool,
  editable: PropTypes.bool,
  onClick: PropTypes.func
};
