import React, { Component } from "react";
import PropTypes from "prop-types";

class Layout extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <div className="body-container flex flex-col items-start justify-start flex-1 p-1 overflow-hidden h-full">
          <div className="min-h-full custom-width-99">
            {this.props.children}
          </div>
        </div>
      </>
    );
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
