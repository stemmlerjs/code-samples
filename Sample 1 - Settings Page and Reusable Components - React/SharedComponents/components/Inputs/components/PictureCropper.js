import React from "react";
import PropTypes from 'prop-types'

import "modules/SharedComponents/styles/Cropper.global.css";

import { initCropper, crop, rotate, zoom, reset, destroy } from "helpers/cropper.js";

// If testing needs to be done with an image src use https://i.imgur.com/yrHkyBF.jpg
export default class PictureCropper extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      no: true
    }

    this.handleCrop = this.handleCrop.bind(this);
  }

  componentWillUnmount() {
    // destroy the cropper
    destroy();
  }

  handleCrop (e) {
    // Stop the event click from bubbling lower onto 
    // other components.
    e.preventDefault();
    e.stopPropagation();
    
    crop(
      croppedfile => {
          // File cropped do something
        this.props.onCrop(croppedfile)
      },
      err => {
        console.warn("error with cropping image", err);
      },
      { previewcrop: false, circle: false } // not required
    );
  }

  render() {
    // Note: this file is using a global css file, not css modules
    let circle = true;
    return (
      <div
        className={
          circle ? "circleCropperContainer" : "cropperContainer"
        }
      >
        <div id="cropperWrapper" className={"cropperWraper"} />

        {/* Show a preview of the image after cropped */}
        <div id={"cropperResults"} />

        <div className={"cropperInnerContainer"}>
          <input
            id={"cropperSlider"}
            data-cy={"picture-cropper-slider"}
            type={"range"}
            className={"cropSlider"}
            onInput={e => zoom(Number(e.target.value))}
            step="1"
          />

          <p className={"editMessage"}>
            Drag and zoom to edit your new picture
          </p>

          <div className={"buttons"}>
            <button
              id={"btnCrop"}
              data-cy={"picture-cropper-crop-button"}
              type={"button"}
              className={"cropButton"}
              onClick={this.handleCrop}
            >
              Save
            </button>
            <button
              id={"btnCancel"}
              data-cy={"picture-cropper-cancel-button"}
              type={"button"}
              className={"cancelButton"}
              onClick={this.props.cancelCrop}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
}

PictureCropper.propTypes = {
  onDoneCrop: PropTypes.func.isRequired,
  cancelCrop: PropTypes.func.cancelCrop,
  cicrle: PropTypes.bool
}
