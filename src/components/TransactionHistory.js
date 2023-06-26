import React, { Component } from "react";
import {
  // TransWalletIcon,
  // TransactionIcon,
  // TransactionUSD,
  ExternalLink,
} from "../components/icon/icon";
import {
  // displayBalance,
  displayCommaBalance,
} from "./inputValidation";
import PropTypes from "prop-types";
import { getShortenedAddress } from "../utils/addressUtils";
import moment from "moment";

// import Dollar from "../assets/images/dollar.svg";
class TransactionHistory extends Component {
  constructor(props) {
    super(props);
    this.state = { isUser: true };
  }

  _handleTxHistoryChange = (userTxFlag) => {
    if (this.state.isUser !== userTxFlag) {
      this.setState({
        isUser: userTxFlag,
      });
    }
  };

  render() {
    return (
      <>
        <div className="card-coin">
          <div className="flex justify-between items-center pb-4">
            <h2 className="font-bold text-xl">Transaction History</h2>
            <div className="flex gap-4">
              <div
                className={
                  "saving-tab py-3 px-6 cursor-pointer" +
                  (this.state.isUser ? " saving-tab-active" : "")
                }
                onClick={() => this._handleTxHistoryChange(true)}
              >
                Your Transactions
              </div>
              <div
                className={
                  this.props.adminTxs.length !== 0
                    ? +"saving-tab py-3 px-6 cursor-pointer " +
                      (this.state.isUser ? "" : "saving-tab-active")
                    : "hide-data"
                }
                onClick={() => this._handleTxHistoryChange(false)}
              >
                Admin Transactions
              </div>
            </div>
          </div>
          <hr style={{ width: "95%" }}></hr>
          <div style={{ maxHeight: 400, overflowY: "auto", width: "100%" }}>
            {(this.state.isUser ? this.props.userTxs : this.props.adminTxs).map(
              (txData, index) => (
                <div key={index}>
                  <div className="grid grid-cols-4 text-center py-4 border-b mr-10">
                    <div className="">
                      <p className="text-secondary font-normal">Timestamp</p>
                      <p className="text-primary pb-4 font-bold">
                        {moment(txData.timestamp).format("Do MMM , YYYY hh:mm")}
                      </p>
                    </div>
                    <div className="">
                      <p className="text-secondary font-normal">
                        Transaction ID
                      </p>
                      <p className="text-primary pb-4 font-bold flex gap-2 justify-center">
                        {getShortenedAddress(txData.txhash) + " "}

                        <a
                          href={
                            this.props.blockExplorer + "tx/" + txData.txhash
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink />
                        </a>
                      </p>
                    </div>
                    <div className="">
                      <p className="text-secondary text-center font-normal">
                        Type
                      </p>
                      <p className="text-primary pb-4 font-bold">
                        {txData.type}
                      </p>
                    </div>
                    <div className="">
                      <p className="text-secondary text-center font-normal">
                        Amount
                      </p>
                      <p
                        className={
                          "gap-2 flex font-bold justify-center " +
                          (txData.type === "Deposit"
                            ? "text-green"
                            : "tertiary-color")
                        }
                      >
                        {displayCommaBalance(
                          this.props.web3.utils.fromWei(
                            txData.amount,
                            this.props.web3EquivalentPrecision
                          ),
                          4
                        ) +
                          " " +
                          this.props.tokenNames[
                            txData.type === "Deposit" ? 0 : 1
                          ]}
                      </p>
                    </div>
                  </div>
                </div>
              )
            )}
            <p
              className={
                (this.state.isUser ? this.props.userTxs : this.props.adminTxs)
                  .length
                  ? "hide-data"
                  : "pt-8 text-center font-bold text-xl"
              }
            >
              You haven’t made any transactions yet
            </p>
          </div>
        </div>
      </>
    );
  }
}

TransactionHistory.propTypes = {
  userTxs: PropTypes.array.isRequired,
  adminTxs: PropTypes.array.isRequired,
  tokenNames: PropTypes.array.isRequired,
  web3: PropTypes.object.isRequired,
  web3EquivalentPrecision: PropTypes.string.isRequired,
  blockExplorer: PropTypes.string.isRequired,
};

export default TransactionHistory;
