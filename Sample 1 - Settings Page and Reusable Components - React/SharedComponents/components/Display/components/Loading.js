import React from "react";
import PropTypes from "prop-types";
import { ClipLoader } from "react-spinners";

const Loading = () => {
  return (
    <div style={{ paddingTop: "30px", textAlign: "center", margin: "0 auto" }}>
      <ClipLoader color={"#aadcff"} loading={true} />
    </div>
  );
};

export default Loading;
