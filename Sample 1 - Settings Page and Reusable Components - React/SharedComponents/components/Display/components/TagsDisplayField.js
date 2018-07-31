import React from "react";
import PropTypes from "prop-types";
import styles from "../styles/TagsDisplayField.css";

function existsAndHasAtLeastOne(tags) {
  if (!!tags == false) return false;
  if (tags.length == 0) return false;
  return true;
}

const Tags = ({ tags, textField, valueField }) => {
  return (
    <div className={styles.tagsContainer}>
      {tags.map((tag, index) => {
        return (
          <span className={styles.tag} key={index}>
            {tag[textField]}
          </span>
        );
      })}
    </div>
  );
};

const TagsDisplayField = ({ tags, title, placeholder, textField, valueField }) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>{title}</div>
      {existsAndHasAtLeastOne(tags) ? (
        <Tags 
          tags={tags} 
          textField={textField}
          valueField={valueField}
        />
      ) : (
        <div className={styles.placeholder}>{placeholder}</div>
      )}
    </div>
  );
};

TagsDisplayField.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  title: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  textField: PropTypes.string.isRequired,
  valueField: PropTypes.string.isRequired
};

export default TagsDisplayField;
