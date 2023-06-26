import React, { Component } from "react";
import Logo from "../assets/images/logo.png";

class sidebar extends Component {
  render() {
    return (
      <>
        <div className="flex h-full flex-col sm:flex-row sm:justify-around relative">
          <div className="w-80 h-screen-custom bg-sidebar overflow-y-hidden">
            <div className="grid justify-center sidebar-back">
              <img src={Logo} alt="" className="h-24" />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default sidebar;
