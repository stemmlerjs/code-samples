import React from "react";
import PropTypes from "prop-types";
import ReactQuill from "react-quill"; // ES6
import styles from '../styles/InputStyles.css'

/**
 * @class RichText
 * @desc This class is a response to us not being able to update
 * quill components normally on the Create Job pages anymore.
 *
 * The reason why that was happening was because ReactQuill was
 * being re-created every time we would update props. It was being
 * re-rendered.
 *
 * Therefore, we've started this class to respond to that problem.
 * Here, we keep our state local and we dispatch the change
 * onBlur
 */

export default class RichText extends React.Component {
  static defaultProps = {
    text: "",
    error: false
  };
  constructor(props) {
    super(props);
    this.state = { text: props.text };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(value) {
    this.setState({ text: value });
    this.props.onChange(value)
  }

  render() {
    console.log('<RichText/>', this.state, this.props);
    return (
      <ReactQuill
        maxLength={this.props.maxLength}
        placeholder={this.props.placeholder}
        data-cy={this.props.cy}
        className={
          this.props.error
            ? `${styles.textArea} ${styles.responsibilitiesClassError}`
            : `${styles.textArea} ${styles.responsibilitiesClass}`
        }
        value={this.state.text}
        onChange={this.handleChange}
        modules={{
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [
              { list: "ordered" },
              { list: "bullet" },
              { indent: "-1" },
              { indent: "+1" }
            ]
          ]
        }}
        formats={[
          "header",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "list",
          "bullet",
          "indent"
        ]}
      />
    );
  }
}

RichText.propTypes = {
  text: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.bool,
  maxLength: PropTypes.number,
  placeholder: PropTypes.string,
  cy: PropTypes.string
};
