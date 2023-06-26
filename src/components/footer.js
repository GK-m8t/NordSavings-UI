import React, { Component } from "react";
import Modal from "react-modal";
import Terms from "./terms";
import Privacy from "./privacy";
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    width: "75%",
    height: "85%",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    background: "var(--color-bg-primary)",
    border: "0",
    borderRadius: "5px",
    overflow: "auto",
  },
};

class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showPrivacy: false,
      showTerms: false,
    };
  }

  handleModalClose = () => {
    this.setState({
      showPrivacy: false,
      showTerms: false,
    });
  };

  render() {
    return (
      <>
        <div className="pt-0  footer-nord-finance">
          <p className="text-center text-xs text-primary dark:text-primary">
            By unlocking Your wallet You agree to our{" "}
            <span
              className="text-green font-semibold cursor-pointer"
              onClick={() => {
                this.setState({
                  showTerms: true,
                  showPrivacy: false,
                });
              }}
            >
              Terms of Service{" "}
            </span>
            and{" "}
            <span
              className="text-green font-semibold cursor-pointer"
              onClick={() => {
                this.setState({
                  showTerms: false,
                  showPrivacy: true,
                });
              }}
            >
              {" "}
              Privacy Policy{" "}
            </span>
            .
          </p>
          <a href="#">
            <p className="pt-4 text-xs text-center text-primary dark:text-primary ">
              <strong> Disclaimer: </strong> Wallets are provided by External
              Providers and by selecting you agree to Terms of those Providers.
              <br></br> Your access to the wallet might be reliant on the
              External Provider being operational.
            </p>
          </a>
        </div>
        <Modal
          isOpen={this.state.showPrivacy || this.state.showTerms}
          shouldCloseOnOverlayClick={true}
          shouldCloseOnEsc={true}
          style={customStyles}
          onRequestClose={this.handleModalClose}
          contentLabel="Policy Modal"
        >
          <div className="">
            {this.state.showPrivacy ? <Privacy /> : <Terms />}
            <div className="flex mt-10 gap-6 justify-end">
              <button
                className=" flex py-2 px-6 btn-green justify-center cursor-pointer focus:outline-none"
                onClick={this.handleModalClose}
              >
                Agree
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }
}
export default Footer;
