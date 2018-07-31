import React from "react";
import PropTypes from "prop-types";

import { SkyLightStateless } from "react-skylight";
import styles from "../styles/ModalStyles.css";

import {
  ButtonSolidAccept,
  ButtonClearCancel
} from "modules/SharedComponents/components/Inputs";
import { ClipLoader } from "react-spinners";

import "../styles/Modal.global.css";

const dialogStyles = {
  margin: "0",
  width: "unset",
  height: "unset",
  position: "fixed",
  top: "3%",
  bottom: "3%",
  left: "3%",
  right: "3%",
  backgroundColor: "#fff",
  borderRadius: "6px",
  zIndex: 100,
  padding: "15px",
  boxShadow: "0 0 4px rgba(0,0,0,.14),0 4px 8px rgba(0,0,0,.28)",
  color: "black",
  overflowY: "scroll"
};

const closeButtonStyle = {
  cursor: "pointer",
  position: "absolute",
  fontSize: "40px",
  right: "15px",
  top: "15px"
};

const AddMoreButton = ({ onClick, text }) => {
  return (
    <div className={styles.addMoreButton} onClick={onClick}>
      {`+ ${text}`}
    </div>
  );
};

class OutsideAlerter extends React.Component {
  constructor(props) {
    super(props);

    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  /**
   * Set the wrapper ref
   */
  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.handleClickOutside();
    }
  }

  render() {
    return <div ref={this.setWrapperRef}>{this.props.children}</div>;
  }
}

/**
 * @class DeleteButton
 * @desc The delete button takes two consecutive clicks to
 * invoke the delete function that is passed in as props.
 */

class DeleteButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      clicked: false
    };

    this.handleClick = this.handleClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  /**
   * handleClickOutside
   *
   * @desc If the item is clicked outside of, then we'll
   * set the clicked to false so that we have to click the
   * buttont twice consecutively again to invoke the function.
   */

  handleClickOutside() {
    this.setState({
      clicked: false
    });
  }

  /**
   * handleClick
   *
   * @desc When the delete button is clicked twice, then
   * we'll delete the item.
   */

  handleClick() {
    if (this.state.clicked) {
      // Now dispatch the delete event
      this.props.onClick();
    } else {
      this.setState({
        ...this.state,
        clicked: true
      });
    }
  }

  render() {
    const { text } = this.props;
    return (
      <OutsideAlerter handleClickOutside={this.handleClickOutside}>
        <div
          className={
            this.state.clicked
              ? `${styles.deleteButtonInitial} ${styles.deleteButtonPost}`
              : styles.deleteButtonInitial
          }
          onClick={this.handleClick}
        >
          {this.state.clicked ? `Click again to delete` : `${text}`}
        </div>
      </OutsideAlerter>
    );
  }
}

const ModalButtons = ({
  buttons,
  isSaving,
  isSavingSuccess,
  isSavingFailure
}) => {
  return (
    <div>
      {!!buttons.addMore ? (
        <AddMoreButton
          onClick={buttons.addMore.onClick}
          text={buttons.addMore.text}
        />
      ) : (
        ""
      )}

      {!!buttons.delete ? (
        <DeleteButton
          onClick={buttons.delete.onClick}
          text={buttons.delete.text}
        />
      ) : (
        ""
      )}

      <div className={styles.buttonsContainer}>
        {!!buttons.cancel ? (
          <ButtonClearCancel
            onClick={buttons.cancel.onClick}
            text={buttons.cancel.text}
          />
        ) : (
          ""
        )}

        {!!buttons.accept ? (
          isSaving ? (
            <ClipLoader color={"#53a7d8"} loading={true} />
          ) : (
            <ButtonSolidAccept
              onClick={buttons.accept.onClick}
              text={buttons.accept.text}
            />
          )
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

ModalButtons.propTypes = {
  accept: PropTypes.shape({
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }).isRequired,
  cancel: PropTypes.shape({
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }).isRequired,
  delete: PropTypes.shape({
    text: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }).isRequired,
  isSaving: PropTypes.bool.isRequired
};

/**
 * @class Modal
 * @desc The Modal class is the parent modal class which all other
 * modals should use as the parent wrapper.
 *
 * For adding new modals to the student profile or employer profile,
 * use the ProfileModal class instead as this is just a building block
 * of that class.
 * @see ProfileModal
 */

const Modal = props => {
  return (
    <div id="modal-container" className={styles.modalContainer}>
      <SkyLightStateless
        isVisible={props.isOpen}
        dialogStyles={dialogStyles}
        closeButtonStyle={closeButtonStyle}
        onCloseClicked={props.onClose}
        onOverlayClicked={props.onClose}
      >
        <div
          className={
            props.styles
              ? `${styles.modalContentContainer} ${
                  props.styles.modalContentContainer
                }`
              : props.centered
                ? `${styles.modalContentContainer} ${styles.centeredModal}`
                : styles.modalContentContainer
          }
        >
          <div>{props.children}</div>

          {!!props.buttons ? (
            <ModalButtons
              buttons={props.buttons}
              isSaving={props.isSaving}
              isSavingSuccess={props.isSavingSuccess}
              isSavingFailure={props.isSavingFailure}
            />
          ) : (
            ""
          )}

          {/**
           * What about when we don't have any buttons but we still
           * want to show loading state
           */

          !!props.buttons == false && props.isSaving ? (
            <ClipLoader color={"#53a7d8"} loading={true} />
          ) : null}
        </div>
      </SkyLightStateless>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.isRequired,
  buttons: PropTypes.shape({
    addMore: PropTypes.shape({
      text: PropTypes.string,
      onClick: PropTypes.func.isRequired
    })
  }),
  isSaving: PropTypes.bool.isRequired,
  isSavingSuccess: PropTypes.bool,
  isSavingFailure: PropTypes.bool,
  styles: PropTypes.object
};

export default Modal;
