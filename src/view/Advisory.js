import React, { Component } from "react";
import TransactionHistory from "../components/TransactionHistory";
import AdvisoryAdmin from "../view/AdvisoryAdmin";
import AdvisoryDetails from "../view/AdvisoryDetails";
import { advisoryData, networkData } from "../config/config";
import {
  displayBalance,
  displayCommaBalance,
} from "../components/inputValidation";
import { NordBigIcon } from "../components/icon/icon";
import PropTypes from "prop-types";

class Advisory extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tempkey: null,
    };
  }

  OnActive = (id) => {
    if (!this.props.accounts[0]) {
      this.props.displayCardClickError();
    } else {
      this.setState(
        {
          tempkey: id,
        },
        () => {
          //  this.calculateBonusAPY();
          scrollTo(0, 0);
        }
      );
    }
  };

  _handleOnBack = () => {
    this.setState({
      tempkey: null,
    });
  };

  render() {
    return (
      <div className="container mx-auto lg:px-32 md:px-10">
        {this.state.tempkey === null ? (
          <div className="lg:grid lg:grid-cols-3 gap-4 my-4">
            {advisoryData.map((data, index) =>
              data.contractDetails[this.props.currentNetworkID] ? (
                <div className="card-coin card-advisory my-6">
                  <div className="mb-8">
                    <NordBigIcon></NordBigIcon>
                    <p className="font-bold mt-4">{data.name}</p>
                    <p className="text-sm text-secondary pt-2">
                      TVL :
                      {(this.props.displayData.tvl?.length
                        ? displayCommaBalance(
                            this.props.displayData.tvl[index],
                            2
                          )
                        : "0") +
                        " " +
                        data.underlyingTokenName}
                    </p>
                  </div>
                  <div className="flex justify-between py-4 mt-4">
                    <div>
                      <p className="flex gap-2">
                        {/* <NordIcon /> */}
                        {/* <img src={NordIcon} alt="" className="" /> */}
                        {data.subname}
                      </p>
                      <p className="text-secondary font-12">
                        Powered by{" "}
                        <span className="font-bold text-primary dark:text-primary font-14">
                          {data.fundManagedBy}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">
                        {"$" +
                          (Object.keys(this.props.displayData).length !== 0 &&
                          this.props.displayData.sharePrices.length
                            ? displayBalance(
                                this.props.displayData.sharePrices[index].mul(
                                  this.props.displayData.tokenPrices[index]
                                ),
                                data.web3EquivalentPrecision,
                                this.props.web3,
                                2,
                                100
                              )
                            : "0.00")}
                      </p>
                      <p className="text-sm text-secondary">Price</p>
                    </div>
                  </div>
                  <hr></hr>
                  <div className="my-2">
                    <p className="text-secondary">Assets</p>
                    <div className="flex gap-4 py-3 items-center">
                      {/* <img src={UNI} alt="" className="h-8" /> */}
                      {data.contractDetails[
                        this.props.currentNetworkID
                      ].activeAssets.map((asset, key) => (
                        <div
                          key={key}
                          className="advisory-asset-icon-container"
                        >
                          <img src={asset.icon} alt="" className="h-8" />
                        </div>
                      ))}
                    </div>
                    <button
                      className="btn-green py-2 px-8 mt-4"
                      onClick={() => this.OnActive(index)}
                    >
                      Invest Now
                    </button>
                  </div>
                </div>
              ) : (
                <></>
              )
            )}
          </div>
        ) : (
          <div className="my-4">
            <AdvisoryDetails
              tempkey={this.state.tempkey}
              web3={this.props.web3}
              web3Biconomy={this.props.web3Biconomy}
              biconomy={this.props.biconomy}
              currentNetworkID={this.props.currentNetworkID}
              accounts={this.props.accounts}
              showErrorMessage={this.props.showErrorMessage}
              showSuccessMessage={this.props.showSuccessMessage}
              setOverlay={this.props.setOverlay}
              updateBalance={this.props.updateBalance}
              handleOnBack={this._handleOnBack}
              displayData={this.props.displayData}
            />
            {Object.keys(this.props.displayData).length !== 0 ? (
              <TransactionHistory
                userTxs={this.props.displayData.txHistory.user}
                adminTxs={this.props.displayData.txHistory.admin}
                tokenNames={[
                  advisoryData[this.state.tempkey].underlyingTokenName,
                  advisoryData[this.state.tempkey].subname,
                ]}
                web3={this.props.web3}
                web3EquivalentPrecision={
                  advisoryData[this.state.tempkey].web3EquivalentPrecision
                }
                blockExplorer={
                  networkData.blockExplorer[this.props.currentNetworkID]
                }
              />
            ) : (
              <></>
            )}
            {Object.keys(this.props.displayData).length !== 0 &&
            this.props.displayData.isfundManager ? (
              <AdvisoryAdmin
                tempkey={this.state.tempkey}
                web3={this.props.web3}
                web3Biconomy={this.props.web3Biconomy}
                biconomy={this.props.biconomy}
                currentNetworkID={this.props.currentNetworkID}
                accounts={this.props.accounts}
                showErrorMessage={this.props.showErrorMessage}
                showSuccessMessage={this.props.showSuccessMessage}
                setOverlay={this.props.setOverlay}
                updateBalance={this.props.updateBalance}
                displayData={{
                  activeAssetsData: this.props.displayData.activeAssetsData,
                }}
              />
            ) : (
              <></>
            )}
          </div>
        )}
        <p className="unavailable px-16">
          {networkData.showAdvisory[this.props.currentNetworkID]
            ? ""
            : "Switch to " +
              networkData.networkName[networkData.allowedNetworkID[1]] +
              " for NORD Advisory"}
        </p>
      </div>
    );
  }
}
Advisory.propTypes = {
  web3: PropTypes.object.isRequired,
  web3Biconomy: PropTypes.object.isRequired,
  biconomy: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  displayData: PropTypes.object.isRequired,
  currentNetworkID: PropTypes.number.isRequired,
  showErrorMessage: PropTypes.instanceOf(Promise),
  showSuccessMessage: PropTypes.instanceOf(Promise),
  displayCardClickError: PropTypes.instanceOf(Promise),
  setOverlay: PropTypes.instanceOf(Promise),
  updateBalance: PropTypes.instanceOf(Promise),
};

export default Advisory;
