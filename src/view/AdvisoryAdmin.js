import React, { Component } from "react";
import { advisoryData } from "../config/config";
import {
  contractOperation,
  contractOperationWithBiconomy,
  claimOperation,
  claimOperationWithBiconomy,
} from "../components/transactionOperations";
import {
  inputCheck,
  displayCommaBalance,
  bnDivision,
} from "../components/inputValidation";
import { Gasless } from "../components/icon/icon";
import Info from "../assets/images/info.svg";
import PropTypes from "prop-types";

class AdvisoryAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = { percentageInput: [], percentageErr: "", isGasless: true };
  }

  amountValidation = async (event, index) => {
    const input =
      this.state.percentageInput.length ===
      this.props.displayData.activeAssetsData.length
        ? this.state.percentageInput
        : this.props.displayData.activeAssetsData.slice().fill("");
    const amt = await inputCheck(event, 2);
    if (amt !== "invalid") {
      input[index] = amt;
    }
    this.setState(() => {
      return {
        percentageInput: input,
        percentageErr: "",
      };
    });
  };

  resetInput = () => {
    this.setState({
      percentageInput: [],
    });
    scrollTo(0, 0);
  };

  getParameters = async () => {
    const activeAssets = [];
    const investmentRatioNumerators = [];
    const exchangeAdapters = [];
    for (const index in advisoryData[this.props.tempkey].contractDetails[
      this.props.currentNetworkID
    ].activeAssets) {
      if (
        !this.state.percentageInput[index] ||
        this.state.percentageInput[index] === ""
      ) {
        return "invalid";
      } else {
        investmentRatioNumerators.push(
          this.props.web3.utils.toBN(this.state.percentageInput[index] * 100)
        );
      }
      activeAssets.push(
        advisoryData[this.props.tempkey].contractDetails[
          this.props.currentNetworkID
        ].activeAssets[index].contractAddress[this.props.currentNetworkID]
      );
      exchangeAdapters.push(
        advisoryData[this.props.tempkey].contractDetails[
          this.props.currentNetworkID
        ].activeAssets[index].exchangeAdapterAddress[
          this.props.currentNetworkID
        ]
      );
    }
    return [
      activeAssets,
      investmentRatioNumerators,
      exchangeAdapters,
      // TODO : Withdraw asset with max % first, need to handle that here
      [...activeAssets],
    ];
  };

  initiateAdminFunction = async (operationType) => {
    const parameters = await this.getParameters();
    if (parameters === "invalid") {
      this.setState({
        percentageErr: "Please fill in all required field!",
      });
    } else {
      this.executeAdminFunction(operationType, parameters);
    }
  };

  executeAdminFunction = async (operationType, parameters) => {
    this.setState({
      percentageErr: "",
    });
    let operationFlag = false;
    const adminOperation = new (
      advisoryData[this.props.tempkey].contractDetails[
        this.props.currentNetworkID
      ].enableBiconomy && this.state.isGasless
        ? this.props.web3Biconomy
        : this.props.web3
    ).eth.Contract(
      advisoryData[this.props.tempkey].contractDetails[
        this.props.currentNetworkID
      ].fundDivisionABI.abi,
      advisoryData[this.props.tempkey].contractDetails[
        this.props.currentNetworkID
      ].fundDivisionAddress
    );
    scrollTo(0, 0);
    this.props.setOverlay(
      true,
      operationType.substring(0, operationType.length - 1) +
        operationType
          .substring(operationType.length - 1, operationType.length)
          .replace("e", "ing") +
        " Assets...",
      ""
    );
    if (operationType === "Rebalance") {
      if (
        advisoryData[this.props.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy &&
        this.state.isGasless
      ) {
        operationFlag = await claimOperationWithBiconomy(
          this.props.setOverlay,
          adminOperation,
          "rebalanceAssets",
          this.props.accounts[0],
          this.props.biconomy
        );
      } else {
        operationFlag = await claimOperation(
          this.props.setOverlay,
          adminOperation,
          "rebalanceAssets",
          this.props.accounts[0]
        );
      }
    } else if (operationType === "Reconfigure") {
      if (
        advisoryData[this.props.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy &&
        this.state.isGasless
      ) {
        operationFlag = await contractOperationWithBiconomy(
          this.props.setOverlay,
          adminOperation,
          "configureStrategy",
          this.props.accounts[0],
          this.props.biconomy,
          parameters
        );
      } else {
        operationFlag = await contractOperation(
          this.props.setOverlay,
          adminOperation,
          "configureStrategy",
          this.props.accounts[0],
          parameters
        );
      }
    }
    if (operationFlag) {
      this.props.showSuccessMessage(
        "Successfully " + operationType + " Assets"
      );
      if (operationType === "Reconfigure") {
        this.resetInput();
      }
      this.updateBalanceAfterTx();
    } else {
      this.props.showErrorMessage("Failed to " + operationType + " assets");
    }
  };

  updateBalanceAfterTx = async () => {
    this.props.setOverlay(true, "Updating Balance...", "");
    await this.props.updateBalance();
    this.props.setOverlay(false, "", "");
  };

  displayPercentageData = (index) => {
    const displayAmt = bnDivision(
      this.props.displayData.activeAssetsData[index].share,
      this.props.web3.utils.toBN("100"),
      this.props.web3,
      2
    );
    return displayCommaBalance(displayAmt, 2);
  };

  _handleBiconomyGaslessChange = () => {
    this.setState({
      isGasless: !this.state.isGasless,
    });
  };

  render() {
    return (
      <>
        <div className="coninter mx-auto">
          <div className="card-coin">
            <h2 className="text-xl font-bold pb-4">Assets</h2>
            <hr></hr>
            {this.props.currentNetworkID &&
              this.props.tempkey !== null &&
              advisoryData[this.props.tempkey].contractDetails[
                this.props.currentNetworkID
              ] &&
              advisoryData[this.props.tempkey].contractDetails[
                this.props.currentNetworkID
              ].activeAssets.map((asset, index) => (
                <div className="grid grid-cols-3 py-4" key={index}>
                  <div>
                    <div className="flex gap-4 items-center ">
                      <img src={asset.icon} alt="" className="h-5" />
                      <p className="font-bold">{asset.subname}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold">
                      {this.displayPercentageData(index)}%
                    </p>
                  </div>
                  <div>
                    <input
                      id={"Percentage Input" + index}
                      type="text"
                      className="bg-transparent font-bold"
                      placeholder="Enter New Percentage"
                      value={this.state.percentageInput[index]}
                      onChange={(e) => this.amountValidation(e, index)}
                    />
                  </div>
                </div>
              ))}
            <hr></hr>
            <div className="flex justify-between">
              <div className="gap-6 flex pt-8">
                <button
                  className="btn-green py-2 px-8"
                  onClick={() => this.initiateAdminFunction("Reconfigure")}
                >
                  Reconfigure
                </button>
                <button
                  className="btn-green py-2 px-8"
                  onClick={() => this.executeAdminFunction("Rebalance")}
                >
                  Rebalance
                </button>
              </div>
              <div
                className={
                  "pt-6 flex gap-2 items-center justify-end " +
                  (advisoryData[this.props.tempkey].contractDetails[
                    this.props.currentNetworkID
                  ].enableBiconomy
                    ? ""
                    : "hide-data")
                }
              >
                <div className="flex gap-2">
                  <Gasless> </Gasless>
                  <p className="text-green">
                    Go Gasless
                    <div className={"tooltip"}>
                      <img
                        src={Info}
                        alt=""
                        className="mb-1 ml-1 h-4 w-3 cursor-pointer"
                      />
                      <span className="tooltiptext">
                        <p className="mx-5 text-left text-primary dark:text-primary ">
                          Check if you want to enable biconomy gasless
                          transaction
                        </p>
                      </span>
                    </div>
                  </p>
                </div>
                <label className="container-label">
                  <input
                    type="checkbox"
                    className=""
                    checked={this.state.isGasless}
                    onChange={this._handleBiconomyGaslessChange}
                  />
                  <span className="checkmark"></span>
                </label>
              </div>
            </div>
            <div
              className={
                "gap-6 pt-4 " + (this.state.percentageErr ? "" : "hide")
              }
            >
              <p className="text-sm pl-20 tertiary-color">
                {this.state.percentageErr ? this.state.percentageErr : "valid"}
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
}
AdvisoryAdmin.propTypes = {
  tempkey: PropTypes.number.isRequired,
  web3: PropTypes.object.isRequired,
  web3Biconomy: PropTypes.object.isRequired,
  biconomy: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  displayData: PropTypes.object.isRequired,
  currentNetworkID: PropTypes.number.isRequired,
  showErrorMessage: PropTypes.instanceOf(Promise),
  showSuccessMessage: PropTypes.instanceOf(Promise),
  setOverlay: PropTypes.instanceOf(Promise),
  updateBalance: PropTypes.instanceOf(Promise),
};

export default AdvisoryAdmin;
