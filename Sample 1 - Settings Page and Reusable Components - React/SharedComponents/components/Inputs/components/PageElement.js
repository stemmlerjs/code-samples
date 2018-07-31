import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/InputStyles.css";
import { ImageAndDetailsDisplayField } from "modules/SharedComponents/components/Display";
import ProfileModal from "./ProfileModal";

/**
 * @class PageElement
 * @desc Element that has a body of data to it that needs to
 * also be edited within a page/modal.
 */

export default class PageElement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isEditModalOpen: false
    };

    this.handleOpenEditModal = this.handleOpenEditModal.bind(this);
    this.handleCloseEditModal = this.handleCloseEditModal.bind(this);
    this.handleUpdateEditModalValue = this.handleUpdateEditModalValue.bind(
      this
    );
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleOpenEditModal() {
    this.setState({
      ...this.state,
      isEditModalOpen: true
    });
  }

  handleCloseEditModal(param) {
    console.log("handle close edit modal", param);
    this.setState({
      ...this.state,
      isEditModalOpen: false
    });
  }

  handleUpdateEditModalValue(params, params2) {
    console.log("update edit modal value");
  }

  /**
   * handleSubmit
   *
   * Because we're dealing with a set of data, we need to
   * utilize the current index to update only that item in
   * the set; then we can dispatch the update to the redux
   * store.
   */

  handleSubmit(modalName, values, afterSubmitCb) {
    let index = this.props.index;
    // Update the parent component (should submit)
    this.props.onChange(values, index, () => {
      // Close this component
      this.handleCloseEditModal();
    });
  }

  render() {
    const {
      displayValue,
      editPageValues,
      index,
      modalName,
      onDelete,
      canDelete
    } = this.props;
    const {
      lineOne,
      lineTwo,
      lineThree,
      image,
      companyName,
      removeBottomBorder
    } = displayValue;

    return (
      <div>
        {/* Display element */}
        <ImageAndDetailsDisplayField
          lineOne={lineOne}
          lineTwo={lineTwo}
          lineThree={lineThree}
          image={image}
          companyName={companyName}
          removeBottomBorder={true}
          editable={true}
          onClick={this.handleOpenEditModal}
        />
        {/* Modal for that element */}
        <ProfileModal
          title={"Edit work experience"}
          // description={modal.description}
          values={editPageValues}
          modalReduxState={{
            isOpen: this.state.isEditModalOpen,
            isSaving: false,
            isSavingSuccess: false,
            isSavingFailure: false
          }}
          handleCloseModal={this.handleCloseEditModal}
          updateValue={this.handleUpdateEditModalValue}
          handleSubmit={this.handleSubmit}
          modalName={modalName}
          onDelete={onDelete}
          canDelete={canDelete}
          index={index}
          allElements={this.props.allElements}
        />
      </div>
    );
  }
}

PageElement.propTypes = {
  displayValue: PropTypes.shape({
    lineOne: PropTypes.string.isRequired,
    lineTwo: PropTypes.string.isRequired,
    lineThree: PropTypes.string.isRequired,
    image: PropTypes.string,
    companyName: PropTypes.string,
    removeBottomBorder: PropTypes.bool
  }).isRequired,
  index: PropTypes.number.isRequired,
  modalName: PropTypes.string,
  onChange: PropTypes.func.isRequired
};
