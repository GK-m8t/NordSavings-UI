import React, { Component } from "react";
import { networkData } from "../config/config";
import { displayBalance } from "../components/inputValidation";
import { contractOperation } from "../components/transactionOperations";
import PropTypes from "prop-types";
const mintalbeERC20 = require("../abi/MintableERC20.json");

class Faucet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stakingAmount: "",
      stakingErr: "",
      displayInfiniteSwitch: false,
      infiniteApproval: true,
      isConfirmPopupOpen: false,
      details: true,
      tempkey: null,
      isLoading: true,
      isChecked: false,
    };
  }

  executeClaimToken = async (token, amount) => {
    if (this.props.accounts[0]) {
      this.props.setOverlay(true, `Getting ${amount} ${token}...`, "");
      let claimOperationFlag = false;
      const claimOperation = new this.props.web3.eth.Contract(
        mintalbeERC20.abi,
        this.getAddressFromToken(token)
      );

      claimOperationFlag = await contractOperation(
        this.props.setOverlay,
        claimOperation,
        "mint",
        this.props.accounts[0],
        this.props.web3,
        [
          this.props.web3.utils.toBN(
            this.props.web3.utils.toWei(amount, this.getTokenPrecision(token))
          ),
        ]
      );

      if (claimOperationFlag) {
        this.props.showSuccessMessage(
          `Successfully claimed ${amount} ${token}`
        );
        this.updateBalanceAfterTx();
      } else {
        this.props.showErrorMessage(`Failed to claim ${amount} ${token}`);
      }
    } else {
      this.props.displayCardClickError();
    }
  };

  getAddressFromToken = (token) => {
    let address = "";
    switch (token) {
      case "USDC":
        address = "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e";
        break;
      case "USDT":
        address = "0xBD21A10F619BE90d6066c941b04e340841F1F989";
        break;
      case "DAI":
        address = "0x001B3B4d0F3714Ca98ba10F6042DaEbF0B1B7b6F";
        break;
      case "NORD":
        address = "0x17dd8Bfce2a7080f1adAd6bFD31B6D53978Ae9B5";
        break;
    }
    return address;
  };

  getTokenPrecision = (token) => {
    if (token === "USDT" || token === "USDC") {
      return "picoether";
    }

    return "ether";
  };

  updateBalanceAfterTx = async () => {
    this.props.setOverlay(true, "Updating Balance...", "");
    await this.props.updateBalance();
    this.props.setOverlay(false, "", "");
  };

  resetInput = () => {
    this.setState({
      stakingAmount: "",
      stakingErr: "",
    });
  };

  render() {
    return (
      <>
        <div className="grid lg:grid-cols-2 md:grid-cols-1 px-8 py-8 gap-4 md:w-1/2 lg:w-full">
          {this.props.currentNetworkID === 80001 ? (
            ["USDC", "USDT", "DAI", "NORD"].map((item, index) => (
              <div key={item}>
                <button
                  className="py-2 btn-deposit-biance"
                  onClick={() => this.executeClaimToken(item, "5000")}
                >
                  {`5000 ${item}`}
                </button>
                <h5 className="font-bold py-2">
                  {(Number(this.props.depositBalance[index])
                    ? displayBalance(
                        this.props.depositBalance[index],
                        item === "DAI" ? "ether" : "picoether",
                        this.props.web3
                      )
                    : item === "NORD"
                    ? displayBalance(
                        this.props.nordBalance,
                        "ether",
                        this.props.web3
                      )
                    : "0") +
                    " " +
                    `${item}`}
                </h5>
              </div>
            ))
          ) : (
            <p className="unavailable ml-8">
              {"Faucet is not available on " +
                networkData.networkName[this.props.currentNetworkID]}
            </p>
          )}
        </div>
      </>
    );
  }
}

Faucet.propTypes = {
  web3: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  nordBalance: PropTypes.string.isRequired,
  currentNetworkID: PropTypes.number.isRequired,
  setOverlay: PropTypes.instanceOf(Promise),
  updateBalance: PropTypes.instanceOf(Promise),
  depositBalance: PropTypes.array.isRequired,
  showErrorMessage: PropTypes.instanceOf(Promise),
  showSuccessMessage: PropTypes.instanceOf(Promise),
  displayCardClickError: PropTypes.instanceOf(Promise),
};

export default Faucet;
