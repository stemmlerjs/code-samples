import React from "react";
import PropTypes from "prop-types";

import {
  Modal,
  ModalDescription
} from "modules/SharedComponents/components/Display";

import {
  TextInput,
  TextAreaInput,
  ButtonSolidAccept,
  ButtonClearCancel,
  FileInput,
  Dropdown,
  RadioButtons,
  DateComponent,
  PageElement,
  TagsInput
} from "modules/SharedComponents/components/Inputs";

/**
 * ProfileModal
 *
 * @class ProfileModal
 * @desc This component essentially extends the Modal class and
 * provides an interface to easily add input fields to a modal.
 * It maintains it's own internal state and only passes the value back
 * when the user clicks the Save button.
 *
 * @see Modal
 */

class ProfileModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      values: props.values, // most values will be undefined because of async calls, see componentWillReceiveProps
      addElementModal: {
        isOpen: false,
        isSaving: false,
        isSavingSuccess: false,
        isSavingFailure: false,
        values: {},
        allElements: props.allElements
      }
    };
    this.updateValue = this.updateValue.bind(this);
    this.afterSaving = this.afterSaving.bind(this);
    this.handleOpenAddElementModal = this.handleOpenAddElementModal.bind(this);
    this.handleCloseAddElementModal = this.handleCloseAddElementModal.bind(
      this
    );
    this.handleDeleteElement = this.handleDeleteElement.bind(this);
  }

  /**
   * componentWillReceiveProps
   * @desc This is important. When we open a modal, we take current
   * values from the redux store and place a copy of that onto the
   * local state. 
   * 
   * Because we do this every time we open a modal, if we make changes
   * in a modal, close it and then come back to the modal, the changes
   * will be lost (which is intended behaviour!) until we click "Save".
   */

  componentWillReceiveProps (newProps) {
    let wasOpen = this.props.modalReduxState.isOpen;
    let isGonnaOpen = newProps.modalReduxState.isOpen;

    if (!wasOpen && isGonnaOpen) {
      this.setState({
        ...this.state,
        values: this.props.values
      })
    }
  }

  /**
   * updateValue
   *
   * @desc When we change a field, we want to update
   * the local state of that field instead of altering
   * what it currently is in the redux store.
   *
   * By doing it this way, we can:
   * - compare before and after values
   * - validate the new value without
   * - determine if there were any changes
   * - only dispatch a save() and update the value in the redux
   *   store on a successful save.
   *
   * @param {String} field to update
   * @param {Any} new value for that field
   * @param {Number} if the value is an array, we need to know which array to edit
   * @param {Function} what to do after submitting
   */

  updateValue(field, newValue, index, cb, type) {
    if (!!type) {
      switch (type) {

        /**
         * Addings tags is a little bit different because when we 
         * update the value,
         * the new value is actually a new array of values.
         */

        case "tags":
          // Get previous tags value
          let prevTagsValue;
          this.state.values.forEach((value) => {
            if (value.name == field) {
              prevTagsValue = value.value;
            }
          })

          // Add it to the list
          prevTagsValue.push(newValue)

          // Update state with new value
          this.setState({
            ...this.state,
            values: this.state.values.map(
              (value, i) => (value.name == field ? { ...value, value: prevTagsValue} : value)
            )
          })
        default:
          return;
      }
    }

    else if (isNaN(index)) {
      this.setState({
        values: this.state.values.map(
          (value, i) =>
            value.name == field ? { ...value, value: newValue } : value
        )
      });
    } else {
      /**
       * If the index and cb variable is present, it means that we'd
       * like to update and submit this component.
       */

      let allNewValues = this.state.values.map((value, i) => {
        if (value.index == index) {
          /**
           * Now, we have to update each value with this new value
           */

          return {
            ...value,
            editPageValues: value.editPageValues.map(editPageValue => {
              return {
                ...editPageValue,
                value: newValue[editPageValue.name]
              };
            })
          };
        } else {
          return value;
        }
      });

      this.setState({
        values: allNewValues
      });

      /**
       * Submit and update props.
       */

      if (cb) {
        // Perform the props update from the parent component
        this.props.handleSubmit(
          this.props.modalName,
          {
            workExperience: allNewValues.map(val => val.editPageValues)
          },
          () => {
            allNewValues.map(value => {
              let newValue = {};
              value.editPageValues.forEach(editValue => {
                newValue[editValue.name] = editValue.value;
              });
              this.props.updateValue(value.name, newValue, true, value.index);
            });
            cb();
          }
        );
      }
    }
  }

  /**
   * afterSaving
   *
   * @desc After we successfully save the profile section, we want to
   * update the redux store with these fields.
   */

  afterSaving() {
    this.state.values.map(value => {
      this.props.updateValue(value.name, value.value, true);
    });
    this.props.handleCloseModal();
  }

  /**
   * getValues
   *
   * @desc Gets the values from state that we want to update
   * in the backend.
   *
   * @return Object
   */

  getValues() {
    let retObj = {};
    this.state.values.map(value => {
      retObj[value.name] = value.value;
    });
    return retObj;
  }

  getValueOf(field) {
    let valueOf;
    this.state.values.map(value => {
      if (value.name == field) valueOf = value.value;
    });
    return valueOf;
  }

  handleGetAddElementModalValueOf(field) {
    let valueOf;
    valueOf = this.state.addElementModal.values[field];
    return valueOf;
  }

  handleOpenAddElementModal() {
    this.setState({
      ...this.state,
      addElementModal: {
        ...this.state.addElementModal,
        isOpen: true
      }
    });
  }

  handleCloseAddElementModal() {
    this.setState({
      ...this.state,
      addElementModal: {
        ...this.state.addElementModal,
        isOpen: false
      }
    });
  }

  handleUpdateAddModalValue(name, value) {
    this.setState({
      ...this.state,
      addElementModal: {
        ...this.state.addElementModal,
        values: {
          ...this.state.addElementModal.values,
          [name]: value
        }
      }
    });
  }

  /**
   * handleDeleteElement
   *
   * @desc Delete the current selected item.
   */

  handleDeleteElement() {
    let indexToDelete = this.props.index;
    let existingValues = this.props.allElements;
    existingValues.splice(indexToDelete, 1);

    // Save items
    this.props.handleSubmit(
      this.props.modalName,
      {
        workExperience: existingValues
      },
      () => {
        // TODO: remove using 'workExperience', use props.elementName
        // update props
        this.props.updateValue("workExperience", existingValues, true, null);

        // Show success
      }
    );
  }

  render() {
    // console.log('<ProfileModal/>', this.props, this.state)
    const { 

      /**
       * @desc {String} title
       * Shows at the top of the modal
       */

      title,

      /**
       * @desc {String} description
       * Shows underneath the title describing what this modal
       * is used for.
       */

      description,

      /**
       * @desc {String} modalName
       * Modal constant. Used for when we dispatch a save event
       * to specify which section needs to be saved.
       */

      modalName,

      /**
       * @desc {Array} values
       * An array containing the fields that need to be displayed,
       * their values, and their type. All of this is used in order
       * to render the form.
       */

      values,

      /**
       * @desc {Object} modalReduxState
       * Contains all of the redux state for this modal.
       */

      modalReduxState,

      /**
       * @desc {Function} handleCloseModal
       * Close the modal.
       */

      handleCloseModal,

      /**
       * @desc {Object} buttons
       * Describes the structure of the buttons on the
       * modal
       */

      buttons,

      /**
       * @desc canAddMore
       * Specifies if we can add more of this type of element.
       * Can only be used on pages that have type=pageElement
       */

      canAddMore,

      /**
       * @desc elementName
       * Specifies the name that we use for the element that we
       * can add more of.
       */

      elementName,

      elementTemplate,

      allElements,

      /**
       * @desc elementPropName
       * The name that we use to update the element props after
       * we've finished saving it.
       */

      elementPropName,

      onDelete,

      canDelete,

      /**
       * @desc index
       * When ProfileModal is instantiated from a PageElement,
       * index holds the index of the element currently displayed.
       * @see handleDeleteElement(index)
       */

      index
    } = this.props;

    console.log('<ProfileModal/>', this.state, this.props)

    const {
      isOpen,
      isSaving,
      isSavingSuccess,
      isSavingFailure
    } = modalReduxState;
    // console.log("<ProfileModal/> state", this.state, this.props);

    /**
     * Create the buttons config.
     * If the visible key on the accept object is false,
     * then we're not going to render the accept button.
     */

    let buttonsConfig = {
      accept: {
        text: "Save",
        onClick: () =>
          this.props.handleSubmit(modalName, this.getValues(), this.afterSaving)
      },
      cancel: {
        text: "Cancel",
        onClick: handleCloseModal
      }
    };

    if (!!buttons) {
      if (!!buttons.accept) {
        // If the visible == false, then delete the accept button.
        if (!buttons.accept.visible) {
          delete buttonsConfig.accept;
        }
      }
    }

    /**
     * If the addmore button should be included,
     * we'll add it to the button config here.
     *
     * If enabled, we will allow the modal to do:
     * - adds
     * - deletes
     */

    if (!!canAddMore) {
      buttonsConfig.addMore = {
        text: `Add ${elementName ? elementName : "item"}`,
        onClick: this.handleOpenAddElementModal
      };
    }

    if (!!this.props.canDelete) {
      buttonsConfig.delete = {
        text: `Delete ${elementName ? elementName : "item"}`,
        onClick: this.handleDeleteElement
      };
    }

    return (
      <Modal
        isOpen={isOpen}
        isSaving={isSaving}
        isSavingSuccess={isSavingSuccess}
        isSavingFailure={isSavingFailure}
        onClose={handleCloseModal}
        buttons={buttonsConfig}
      >
        {!!title ? <h1>{title}</h1> : ""}
        {!!description ? <ModalDescription text={description} /> : null}

        {/**
         * Modal fields
         *
         * @desc We display form fields on the screen through using
         * a config object.
         */
        !!values
          ? values.map((value, index) => {
              switch (value.type) {
                case "file":
                  return (
                    <FileInput
                      key={index}
                      urlOrFile={this.getValueOf(value.name)}
                      displayName={value.displayName}
                      onChange={e => this.updateValue(value.name, e)}
                      name={value.name}
                    />
                  );
                case "dropdownlist":
                  return (
                    <Dropdown
                      key={index}
                      defaultValue={this.getValueOf(value.name)}
                      onChange={e => this.updateValue(value.name, e)}
                      displayName={value.displayName}
                      list={value.list}
                      textField={value.textField}
                      valueField={value.valueField}
                      allowCreate={value.allowCreate}
                    />
                  );
                case "textarea":
                  return (
                    <TextAreaInput
                      key={index}
                      value={this.getValueOf(value.name)}
                      maxCharacters={value.maxCharacters}
                      onChange={e =>
                        this.updateValue(value.name, e.target.value)
                      }
                      displayName={value.displayName}
                    />
                  );
                case "text":
                  return (
                    <TextInput
                      key={index}
                      value={this.getValueOf(value.name)}
                      maxCharacters={value.maxCharacters}
                      onChange={e =>
                        this.updateValue(value.name, e.target.value)
                      }
                      displayName={value.displayName}
                    />
                  );
                case "number":
                  return (
                    <TextInput
                      key={index}
                      value={this.getValueOf(value.name)}
                      maxCharacters={value.maxCharacters}
                      onChange={e =>
                        this.updateValue(value.name, e.target.value)
                      }
                      displayName={value.displayName}
                      type={"number"}
                      maxValue={value.maxValue}
                      minValue={value.minValue}
                    />
                  );
                case "radio":
                  return (
                    <RadioButtons
                      key={index}
                      displayName={value.displayName}
                      options={value.options}
                      value={this.getValueOf(value.name)}
                      onChange={e =>
                        this.updateValue(
                          value.name,
                          e.target.getAttribute("data-check-value") == "true"
                        )
                      }
                    />
                  );
                case "date":
                  return (
                    <DateComponent
                      value={this.getValueOf(value.name)}
                      onChange={e => this.updateValue(value.name, e)}
                      displayName={value.displayName}
                    />
                  );
                case "pageElement":
                  return <PageElement
                    key={index}
                    index={value.index}
                    displayValue={value.displayValue}
                    editPageValues={value.editPageValues}
                    onChange={(e, index, cb) => this.updateValue(value.name, e, index, cb)}      
                    modalName={modalName}
                    canDelete={this.props.canAddMore ? true : false}
                    onDelete={(e) => console.log(e)}
                    allElements={this.props.allElements}
                  />
                case "tags": 
                  return <TagsInput
                    key={index}
                    title={value.title}
                    valueField={value.valueField}
                    textField={value.textField}
                    placeholder={value.placeholder}
                    data={value.data}
                    value={value.value}
                    onChange={e => this.updateValue(value.name, e)}
                    onCreateNewTag={(e) => this.updateValue(value.name, e, null, null, 'tags')}
                  />
                default:
                  return null;
              }
            })
          : null}

        {
          /**
           * @desc AddEditModal
           * This modal allows for users to add additional elements.
           * It should be used on pages like Work Experience where we
           * can add n number of some element.
           */

          <Modal
            isOpen={this.state.addElementModal.isOpen}
            isSaving={this.state.addElementModal.isSaving}
            isSavingSuccess={this.state.addElementModal.isSavingSuccess}
            isSavingFailure={this.state.addElementModal.isSavingFailure}
            onClose={this.handleCloseAddElementModal}
            buttons={{
              accept: {
                text: "Save",
                onClick: () => {
                  let existingValues = this.state.addElementModal.allElements;
                  let newValue = this.state.addElementModal.values;
                  existingValues.push(newValue);
                  this.props.handleSubmit(modalName, existingValues, () => {
                    this.props.updateValue(
                      elementPropName,
                      existingValues,
                      true
                    );
                    this.handleCloseAddElementModal();
                    
                    /**
                     * After we save a new element, we want to
                     * Clear what was on the values so when we open it up
                     * again, it's clear.
                     */

                    // debugger;
                    // let addModalValues = this.state.addElementModal.values;
                    // Object.keys(addModalValues).forEach((key) => {
                    //   addModalValues[key] = "";
                    // })
                    // this.setState({
                    //   ...this.state,
                    //   addElementModal: {
                    //     ...this.state.addElementModal,
                    //     values: addModalValues
                    //   }
                    // })
                    
                  })
                }
              },
              cancel: {
                text: "Cancel",
                onClick: this.handleCloseAddElementModal
              }
            }}
          >
            {!!title ? <h1>Add {title}</h1> : ""}
            {!!description ? <ModalDescription text={description} /> : null}

            {!!elementTemplate
              ? elementTemplate.map((value, index) => {
                  switch (value.type) {
                    case "file":
                      return (
                        <FileInput
                          key={index}
                          urlOrFile={this.handleGetAddElementModalValueOf(
                            value.name
                          )}
                          displayName={value.displayName}
                          onChange={e =>
                            this.handleUpdateAddModalValue(value.name, e)
                          }
                          name={value.name}
                        />
                      );
                    case "dropdownlist":
                      return (
                        <Dropdown
                          key={index}
                          defaultValue={this.handleGetAddElementModalValueOf(
                            value.name
                          )}
                          onChange={e =>
                            this.handleUpdateAddModalValue(value.name, e)
                          }
                          displayName={value.displayName}
                          list={value.list}
                          textField={value.textField}
                          valueField={value.valueField}
                          allowCreate={value.allowCreate}
                        />
                      );
                    case "textarea":
                      return (
                        <TextAreaInput
                          key={index}
                          defaultValue={this.handleGetAddElementModalValueOf(
                            value.name
                          )}
                          maxCharacters={value.maxCharacters}
                          onChange={e =>
                            this.handleUpdateAddModalValue(
                              value.name,
                              e.target.value
                            )
                          }
                          displayName={value.displayName}
                        />
                      );
                    case "text":
                      return (
                        <TextInput
                          key={index}
                          defaultValue={this.handleGetAddElementModalValueOf(
                            value.name
                          )}
                          maxCharacters={value.maxCharacters}
                          onChange={e =>
                            this.handleUpdateAddModalValue(
                              value.name,
                              e.target.value
                            )
                          }
                          displayName={value.displayName}
                        />
                      );
                    case "number":
                      return (
                        <TextInput
                          key={index}
                          defaultValue={this.handleGetAddElementModalValueOf(
                            value.name
                          )}
                          maxCharacters={value.maxCharacters}
                          onChange={e =>
                            this.handleUpdateAddModalValue(
                              value.name,
                              e.target.value
                            )
                          }
                          displayName={value.displayName}
                          type={"number"}
                          maxValue={value.maxValue}
                          minValue={value.minValue}
                        />
                      );
                    case "radio":
                      return (
                        <RadioButtons
                          key={index}
                          displayName={value.displayName}
                          options={value.options}
                          defaultValue={this.handleGetAddElementModalValueOf(
                            value.name
                          )}
                          onChange={e =>
                            this.handleUpdateAddModalValue(
                              value.name,
                              e.target.getAttribute("data-check-value") ==
                                "true"
                            )
                          }
                        />
                      );
                    case "date":
                      return (
                        <DateComponent
                          value={this.handleGetAddElementModalValueOf(
                            value.name
                          )}
                          onChange={e =>
                            this.handleUpdateAddModalValue(value.name, e)
                          }
                          displayName={value.displayName}
                        />
                      );
                    case "pageElement":
                      return (
                        <PageElement
                          key={index}
                          index={value.index}
                          displayValue={value.displayValue}
                          editPageValues={value.editPageValues}
                          onChange={(e, index, cb) =>
                            this.handleUpdateAddModalValue(
                              value.name,
                              e,
                              index,
                              cb
                            )
                          }
                          modalName={modalName}
                          allElements={this.props.allElements}
                        />
                      )
                      default:
                        // console.log('Data type we havent added yet', value)
                        return null;
                    }
                  })
                : (
                  null
                )
            }

          </Modal>
        }
      </Modal>
    );
  }
}

ProfileModal.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  modalName: PropTypes.string.isRequired,
  values: PropTypes.shape({
    type: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    maxCharacters: PropTypes.number
  }),
  modalReduxState: PropTypes.shape({
    isOpen: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    isSavingSuccess: PropTypes.bool.isRequired,
    isSavingFailure: PropTypes.bool.isRequired
  }).isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  updateValue: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  buttons: PropTypes.object,
  canAddMore: PropTypes.bool,
  elementName: PropTypes.string,
  elementTemplate: PropTypes.object,
  allElements: PropTypes.arr,
  elementPropName: PropTypes.string
};

export default ProfileModal;
