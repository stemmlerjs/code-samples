import React from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";

import styles from "../styles/InputStyles.css";

/**
 * FileInputMenu
 *
 * With a file input, we should be able to do the following
 * actions:
 * - download
 * - replace
 * - remove
 */

class FileInputMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.inputMenuContainer}>
        <img src={more} />
        <div className={styles.fileOptionsContainer}>
          <button>View</button>
          <button>Change</button>
          <button>Delete</button>
        </div>
      </div>
    );
  }
}

const SuccessFileText = ({ text }) => {
  return (
    <div className={styles.fileOnFileContainer}>
      <div className={styles.onFile}>{text}</div>
    </div>
  );
};

/**
 * FileInput
 *
 * @param {Boolean} required
 * @param {String}
 */

export default class FileInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dropSuccess: false
    };

    this.handleDrop = this.handleDrop.bind(this);
    this.setDropSuccess = this.setDropSuccess.bind(this);
  }

  /**
   * setDropSuccess
   *
   * Sets the drop state to true after we've successfully
   * dropped a component into the Dropzone.
   */

  setDropSuccess() {
    this.setState({
      dropSuccess: true
    });
  }

  /**
   * handleDrop
   *
   * Confirms that the file dropped is correct, formats the object
   * and returns then result to the calling/parent component so
   * that it may be updated.
   *
   * @param File[]
   * @param {String} - the file name (avatar, resume, transcript)
   *
   */

  handleDrop(files, profileFileType) {
    let file = files[0];

    switch (profileFileType) {
      case "avatar":
        this.props.onChange(file);
        break;
      case "resume":
        this.props.onChange(file);
        break;
      case "transcript":
        this.props.onChange(file);
        break;
      default:
        break;
    }

    this.setDropSuccess();
  }

  render() {
    const {
      name,
      required,
      urlOrFile,
      displayName,
      accept = "application/pdf",
      onChange
    } = this.props;

    return (
      <div className={styles.fileContainer}>
        <label className={styles.fileName}>
          {displayName ? displayName : ""} {required ? " *" : ""}
        </label>

        <Dropzone
          className={styles.fileDropContainer}
          accept={accept}
          multiple={false}
          name={name}
          data-cy={`dropzone-${name}`}
          maxSize={`460000`}
          onDrop={e => this.handleDrop(e, name)}
        >
          {/**
           * If drop success is true, it means that we're getting
           * ready to upload a new file. We should show that to
           * the user.
           */

          this.state.dropSuccess ? (
            <SuccessFileText text={"Ready to upload"} />
          ) : !!urlOrFile ? (
            <SuccessFileText text={"On file"} />
          ) : (
            <div className={styles.fileDropNotUploaded}>Add file</div>
          )}
        </Dropzone>
      </div>
    );
  }
}

FileInput.propTypes = {
  urlOrFile: PropTypes.any,
  displayName: PropTypes.string,
  required: PropTypes.bool,
  name: PropTypes.string.isRequired,
  accept: PropTypes.string
};
