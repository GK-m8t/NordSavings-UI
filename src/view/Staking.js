import React, { Component } from "react";
import Arrow from "../assets/images/arrow.svg";
import Info from "../assets/images/info.svg";
import Close from "../assets/images/back.svg";
import { NordBigIcon, Gasless } from "../components/icon/icon";
import ConfirmModal from "../components/confirmModal";
import CountdownTimer from "../components/countdownTimer";
import { stakingData, networkData } from "../config/config";
import ReactHtmlParser from "react-html-parser";
import {
  inputCheck,
  balanceCheck,
  amountFraction,
  displayBalance,
  displayCommaBalance,
  displayAverageBalance,
} from "../components/inputValidation";
import {
  claimCheck,
  contractOperation,
  contractOperationWithBiconomy,
  claimOperation,
  claimOperationWithBiconomy,
} from "../components/transactionOperations";
import { approveWithBiconomy } from "../components/biconomyApproval";
import PropTypes from "prop-types";

class Staking extends Component {
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
      isChecked: false,
      isGasless: true,
    };
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.state.tempkey !== null &&
      this.props.currentNetworkID !== nextProps.currentNetworkID
    ) {
      this.handleCardClose();
    }
  }

  amountValidation = async (event) => {
    const amt = await inputCheck(event, stakingData[0].precision);
    if (amt !== "invalid") {
      const bal = this.state.isChecked
        ? this.props.displayData.stakeBalances[this.state.tempkey]
        : this.props.displayData.tokenBalances[this.state.tempkey];
      const error = await balanceCheck(
        amt,
        bal,
        stakingData[this.state.tempkey].subname,
        stakingData[this.state.tempkey].web3EquivalentPrecision,
        this.props.web3
      );
      this.setState(() => {
        return { stakingAmount: amt, stakingErr: error };
      });
    }
  };

  initiateOperation = async (inputType) => {
    if (
      inputType === "Unstake" &&
      stakingData[this.state.tempkey].name === "NORD (Old)"
    ) {
      await this._handlePercentageClick(100, 100);
    }
    let amt = this.state.stakingAmount;
    let displaySwitch = false;
    const bal = this.state.isChecked
      ? this.props.displayData.stakeBalances[this.state.tempkey]
      : this.props.displayData.tokenBalances[this.state.tempkey];
    let error = await balanceCheck(
      amt,
      bal,
      stakingData[this.state.tempkey].subname,
      stakingData[this.state.tempkey].web3EquivalentPrecision,
      this.props.web3
    );
    if (!error) {
      if (
        !Number(amt) &&
        inputType === "Unstake" &&
        stakingData[this.state.tempkey].name === "NORD (Old)"
      ) {
        error = "There is no amount to unstake!!!";
      } else if (!Number(amt)) {
        error = "Please enter a valid " + inputType + " amount!!!";
      } else {
        amt =
          amt.substring(0, amt.length - 1) +
          amt.substring(amt.length - 1, amt.length).replace(".", "");
        if (!this.state.isChecked) {
          const approve = new this.props.web3.eth.Contract(
            stakingData[this.state.tempkey].contractDetails[
              this.props.currentNetworkID
            ].tokenABI.abi,
            stakingData[this.state.tempkey].contractDetails[
              this.props.currentNetworkID
            ].tokenAddress
          );
          displaySwitch = await claimCheck(
            amt,
            approve,
            this.props.accounts[0],
            stakingData[this.state.tempkey].contractDetails[
              this.props.currentNetworkID
            ].stakingAddress,
            stakingData[this.state.tempkey].web3EquivalentPrecision,
            this.props.web3
          );
        }
      }
    }
    await this.setState(() => {
      return {
        stakingAmount: amt,
        stakingErr: error,
        displayInfiniteSwitch: displaySwitch,
      };
    });
    if (!this.state.stakingErr) {
      this.openConfirmationPopup();
    }
  };

  executeApproveOperation = async () => {
    let amt = this.props.web3.utils.toBN(
      this.props.web3.utils.toWei(
        this.state.stakingAmount,
        stakingData[this.state.tempkey].web3EquivalentPrecision
      )
    );
    let approveFlag = false;
    if (this.state.displayInfiniteSwitch) {
      const approveOperation = new (
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy && this.state.isGasless
          ? this.props.web3Biconomy
          : this.props.web3
      ).eth.Contract(
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].tokenABI.abi,
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].tokenAddress
      );
      if (this.state.infiniteApproval) {
        amt = this.props.web3.utils.toBN(
          "115792089237316195423570985008687907853269984665640564039457584007913129639935"
        );
        this.props.setOverlay(
          true,
          "Waiting for Infinite " +
            stakingData[this.state.tempkey].subname +
            " Allowance Approval",
          ""
        );
        if (
          stakingData[this.state.tempkey].contractDetails[
            this.props.currentNetworkID
          ].enableBiconomy &&
          this.state.isGasless
        ) {
          approveFlag = await approveWithBiconomy(
            this.props.setOverlay,
            approveOperation,
            [
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].tokenName,
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].tokenAddress,
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].eipVersion,
              this.props.currentNetworkID,
            ],
            this.props.accounts[0],
            this.props.web3Biconomy,
            [
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].stakingAddress,
              amt,
            ]
          );
        } else {
          approveFlag = await contractOperation(
            this.props.setOverlay,
            approveOperation,
            "approve",
            this.props.accounts[0],
            [
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].stakingAddress,
              amt,
            ]
          );
        }
        if (approveFlag) {
          this.props.showSuccessMessage(
            stakingData[this.state.tempkey].subname +
              "-NORD Staking Contract is trusted now!"
          );
        } else {
          this.props.showErrorMessage(
            "Failed to trust " +
              stakingData[this.state.tempkey].subname +
              "-NORD Staking Contract"
          );
        }
      } else {
        this.props.setOverlay(
          true,
          "Waiting for allowance approval of " +
            displayCommaBalance(
              Math.trunc(Number(this.state.stakingAmount) * 10000) / 10000,
              4
            ) +
            " " +
            stakingData[this.state.tempkey].subname,
          ""
        );
        if (
          stakingData[this.state.tempkey].contractDetails[
            this.props.currentNetworkID
          ].enableBiconomy &&
          this.state.isGasless
        ) {
          approveFlag = await approveWithBiconomy(
            this.props.setOverlay,
            approveOperation,
            [
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].tokenName,
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].tokenAddress,
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].eipVersion,
              this.props.currentNetworkID,
            ],
            this.props.accounts[0],
            this.props.web3Biconomy,
            [
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].stakingAddress,
              amt,
            ]
          );
        } else {
          approveFlag = await contractOperation(
            this.props.setOverlay,
            approveOperation,
            "approve",
            this.props.accounts[0],
            [
              stakingData[this.state.tempkey].contractDetails[
                this.props.currentNetworkID
              ].stakingAddress,
              amt,
            ]
          );
        }
        if (approveFlag) {
          this.props.showSuccessMessage(
            displayCommaBalance(
              Math.trunc(this.state.stakingAmount * 10000) / 10000,
              4
            ) +
              " " +
              stakingData[this.state.tempkey].subname +
              " has been successfully approved for stake transfer!"
          );
        } else {
          this.props.showErrorMessage(
            "Failed to approve transfer of " +
              displayCommaBalance(
                Math.trunc(this.state.stakingAmount * 10000) / 10000,
                4
              ) +
              " " +
              stakingData[this.state.tempkey].subname +
              "!"
          );
        }
      }
    } else {
      approveFlag = true;
      this.props.showSuccessMessage(
        displayCommaBalance(
          Math.trunc(this.state.stakingAmount * 10000) / 10000,
          4
        ) +
          " " +
          stakingData[this.state.tempkey].subname +
          " has already been pre-approved"
      );
    }
    if (approveFlag) {
      this.executeStakingOperation("Stake");
    }
  };

  executeStakingOperation = async (inputType) => {
    let stakeOperationFlag = false;
    const stakingOperation = new (
      stakingData[this.state.tempkey].contractDetails[
        this.props.currentNetworkID
      ].enableBiconomy && this.state.isGasless
        ? this.props.web3Biconomy
        : this.props.web3
    ).eth.Contract(
      stakingData[this.state.tempkey].contractDetails[
        this.props.currentNetworkID
      ].stakingABI.abi,
      stakingData[this.state.tempkey].contractDetails[
        this.props.currentNetworkID
      ].stakingAddress
    );
    this.props.setOverlay(
      true,
      inputType.substring(0, inputType.length - 1) +
        inputType
          .substring(inputType.length - 1, inputType.length)
          .replace("e", "ing") +
        "...",
      ""
    );
    if (
      inputType === "Unstake" &&
      stakingData[this.state.tempkey].name === "NORD (Old)"
    ) {
      if (
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy &&
        this.state.isGasless
      ) {
        stakeOperationFlag = await claimOperationWithBiconomy(
          this.props.setOverlay,
          stakingOperation,
          "exit",
          this.props.accounts[0],
          this.props.biconomy
        );
      } else {
        stakeOperationFlag = await claimOperation(
          this.props.setOverlay,
          stakingOperation,
          "exit",
          this.props.accounts[0]
        );
      }
    } else {
      const amt = this.props.web3.utils.toBN(
        this.props.web3.utils.toWei(
          this.state.stakingAmount,
          stakingData[this.state.tempkey].web3EquivalentPrecision
        )
      );
      if (
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy &&
        this.state.isGasless
      ) {
        stakeOperationFlag = await contractOperationWithBiconomy(
          this.props.setOverlay,
          stakingOperation,
          inputType.toLowerCase(),
          this.props.accounts[0],
          this.props.biconomy,
          [amt]
        );
      } else {
        stakeOperationFlag = await contractOperation(
          this.props.setOverlay,
          stakingOperation,
          inputType.toLowerCase(),
          this.props.accounts[0],
          [amt]
        );
      }
    }
    if (stakeOperationFlag) {
      this.props.showSuccessMessage(
        this.state.stakingAmount +
          " " +
          stakingData[this.state.tempkey].subname +
          " has been successfully " +
          inputType.toLowerCase() +
          "d"
      );
      this.resetInput();
      this.updateBalanceAfterTx();
    } else {
      this.props.showErrorMessage(
        "Failed to " +
          inputType.toLowerCase() +
          " " +
          this.state.stakingAmount +
          " " +
          stakingData[this.state.tempkey].subname
      );
    }
  };

  executeRewardOperation = async (claimType) => {
    if (
      (!this.props.displayData.earnBalances[this.state.tempkey].isZero() &&
        (claimType === "Earnings Reward" || claimType === "Reinvest")) ||
      (!this.props.displayData.unclaimedStakeBalances[
        this.state.tempkey
      ].isZero() &&
        claimType === "Stake")
    ) {
      let claimOperationFlag = false;
      const stakingOperation = new (
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy && this.state.isGasless
          ? this.props.web3Biconomy
          : this.props.web3
      ).eth.Contract(
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].stakingABI.abi,
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].stakingAddress
      );
      this.props.setOverlay(
        true,
        claimType === "Stake"
          ? "Claiming Staking Amount..."
          : (claimType === "Earnings Reward" ? "Claiming" : claimType + "ing") +
              " Staking Rewards...",
        ""
      );
      if (
        stakingData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy &&
        this.state.isGasless
      ) {
        claimOperationFlag = await claimOperationWithBiconomy(
          this.props.setOverlay,
          stakingOperation,
          claimType === "Stake"
            ? "claimUnstakedAmount"
            : claimType === "Earnings Reward"
            ? "getReward"
            : claimType.toLowerCase(),
          this.props.accounts[0],
          this.props.biconomy
        );
      } else {
        claimOperationFlag = await claimOperation(
          this.props.setOverlay,
          stakingOperation,
          claimType === "Stake"
            ? "claimUnstakedAmount"
            : claimType === "Earnings Reward"
            ? "getReward"
            : claimType.toLowerCase(),
          this.props.accounts[0]
        );
      }
      if (claimOperationFlag) {
        this.props.showSuccessMessage(
          claimType === "Reinvest"
            ? "Successfully reinvested NORD Rewards"
            : "Successfully claimed NORD " + claimType
        );
        this.updateBalanceAfterTx();
      } else {
        this.props.showErrorMessage(
          claimType === "Reinvest"
            ? "Failed to reinvest NORD Rewards"
            : "Failed to claim NORD " + claimType
        );
      }
    } else {
      this.props.showErrorMessage(
        claimType === "Reinvest"
          ? "No Unclaimed NORD Reward Available for Reinvesting"
          : "No Unclaimed NORD " + claimType + " Available"
      );
    }
  };

  updateBalanceAfterTx = async () => {
    this.props.setOverlay(true, "Updating Balance...", "");
    await this.props.updateBalance();
    this.props.setOverlay(false, "", "");
  };

  openConfirmationPopup = () => {
    this.setState({
      isConfirmPopupOpen: true,
    });
  };

  handlePopupClose = async (confirm) => {
    this.setState({
      isConfirmPopupOpen: false,
    });
    if (confirm) {
      if (this.state.isChecked) {
        this.executeStakingOperation("Unstake");
      } else {
        this.executeApproveOperation();
      }
    } else {
      const orderType = this.state.isChecked ? "Unstake" : "Stake";
      this.props.showErrorMessage(orderType + " Order Cancelled!");
    }
  };

  handleCardClick = async (index) => {
    if (
      stakingData[index].contractDetails[this.props.currentNetworkID]
        .startTime &&
      new Date().getTime() <
        stakingData[index].contractDetails[
          this.props.currentNetworkID
        ].startTime.getTime()
    ) {
      this.props.displayCardClickError(
        "Please wait for the staking period to start."
      );
    } else if (!this.props.accounts[0]) {
      this.props.displayCardClickError();
    } else {
      this.setState({
        tempkey: index,
        details: false,
      });
    }
  };

  handleCardClose = () => {
    this.setState({
      tempkey: null,
      details: true,
      isChecked: false,
    });
    this.resetInput();
  };

  resetInput = () => {
    this.setState({
      stakingAmount: "",
      stakingErr: "",
    });
  };

  _handleStakingChange = () => {
    this.setState({
      isChecked: !this.state.isChecked,
    });
    this.resetInput();
  };

  _handleBiconomyGaslessChange = () => {
    this.setState({
      isGasless: !this.state.isGasless,
    });
  };

  _handleInfiniteApprovalChange = () => {
    this.setState({
      infiniteApproval: !this.state.infiniteApproval,
    });
  };

  _handlePercentageClick = async (numerator, denominator) => {
    if (
      !(!this.state.isChecked && this.displayEndDate(this.state.tempkey, true))
    ) {
      const bal = this.state.isChecked
        ? this.props.displayData.stakeBalances[this.state.tempkey]
        : this.props.displayData.tokenBalances[this.state.tempkey];
      const amt = await amountFraction(
        bal,
        numerator,
        denominator,
        stakingData[this.state.tempkey].web3EquivalentPrecision,
        this.props.web3
      );
      this.setState(() => {
        return { stakingAmount: amt, stakingErr: "" };
      });
    }
  };

  displayEndDate = (date, stakingPeriodCheck) => {
    if (Number.isInteger(date)) {
      const id = date;
      if (
        stakingData[id].contractDetails[this.props.currentNetworkID].startTime
      ) {
        date = new Date(
          stakingData[id].contractDetails[
            this.props.currentNetworkID
          ].startTime.getTime()
        );
        date.setDate(
          date.getDate() +
            stakingData[id].contractDetails[this.props.currentNetworkID]
              .stakingPeriodInDays
        );
        if (stakingPeriodCheck) {
          return new Date().getTime() > date.getTime();
        }
        date = date.toUTCString();
      } else return false;
    }
    date = date.split(" ");
    return date[1] + " " + date[2] + " " + date[3] + " " + date[4];
  };

  render() {
    return (
      <>
        <div className="grid lg:px-32 md:px-4 container mx-auto">
          {this.state.details ? (
            stakingData.map((data, index) =>
              data.contractDetails[this.props.currentNetworkID] ? (
                <div
                  className="card-coin cursor-pointer mt-10"
                  key={index}
                  onClick={() => this.handleCardClick(index)}
                >
                  <div className="lg:flex">
                    <div className="lg:grid lg:w-1/4 md:flex md:w-full vr-border">
                      <div className="flex gap-4">
                        <div className="lg:h-12 md:h-10">
                          {" "}
                          {ReactHtmlParser(data.icon)}{" "}
                        </div>

                        <div className="">
                          <p className="lg:text-base md:text-sm text-primary dark:text-primary">
                            Stake{" "}
                            <span className="text-green dark:text-green">
                              {data.name}
                            </span>
                            <br></br>
                            to get
                            <span className="text-green dark:text-green">
                              {" "}
                              NORD
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="lg:w-3/4 md:full pl-6 md:mt-12">
                      <div className="grid grid-cols-4 gap-4 pb-8">
                        <div>
                          <p className="text-sm text-primary dark:text-primary staking-key-width">
                            {data.subname === "NORD" ? "APR" : "APY"} (%)
                          </p>
                          <p className="font-bold text-sm text-green dark:text-green ">
                            {(this.props.displayData &&
                            !this.displayEndDate(index, true)
                              ? displayCommaBalance(
                                  this.props.displayData.apy[index],
                                  2
                                )
                              : "0") + "%"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-primary dark:text-primary staking-key-width">
                            TVL
                          </p>
                          <p className="font-bold text-sm text-primary dark:text-primary ">
                            {(this.props.displayData
                              ? displayBalance(
                                  this.props.displayData.tvl[index],
                                  data.web3EquivalentPrecision,
                                  this.props.web3
                                )
                              : "0") +
                              " " +
                              data.subname}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-primary dark:text-primary staking-key-width">
                            Staking Period
                          </p>
                          <p className="font-bold text-sm text-primary dark:text-primary">
                            {data.contractDetails[this.props.currentNetworkID]
                              .stakingPeriodInDays
                              ? displayCommaBalance(
                                  data.contractDetails[
                                    this.props.currentNetworkID
                                  ].stakingPeriodInDays,
                                  2
                                ) + " Days"
                              : "Unlimited"}
                          </p>
                        </div>
                        <div>
                          {" "}
                          <p className="text-color staking-key-width text-primary dark:text-primary ">
                            {"End Time (UTC)"}
                          </p>
                          <p className="font-bold text-sm text-primary dark:text-primary ">
                            {data.contractDetails[this.props.currentNetworkID]
                              .startTime
                              ? this.displayEndDate(index)
                              : "Unlimited"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6">
                        <div>
                          <p className="text-sm text-color staking-key-width text-primary dark:text-primary">
                            NORD Earned
                          </p>
                          <p className="font-bold text-sm text-green dark:text-green">
                            {(this.props.displayData
                              ? displayBalance(
                                  this.props.displayData.earnBalances[index],
                                  data.web3EquivalentPrecision,
                                  this.props.web3
                                )
                              : "0") + " NORD"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-color staking-key-width text-primary dark:text-primary">
                            {(data.subname === "NORD" ? "NORD" : "LP") +
                              " Balance"}
                          </p>
                          <p className="font-bold text-sm text-primary dark:text-primary">
                            {(this.props.displayData
                              ? displayBalance(
                                  this.props.displayData.tokenBalances[index],
                                  data.web3EquivalentPrecision,
                                  this.props.web3
                                )
                              : "0") +
                              " " +
                              data.subname}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-color staking-key-width text-primary dark:text-primary">
                            {(data.subname === "NORD" ? "NORD" : "LP") +
                              " Staked"}
                          </p>
                          <p className="font-bold text-sm text-primary dark:text-primary">
                            {(this.props.displayData
                              ? displayBalance(
                                  this.props.displayData.stakeBalances[index],
                                  data.web3EquivalentPrecision,
                                  this.props.web3
                                )
                              : "0") +
                              " " +
                              data.subname}
                          </p>
                        </div>
                        <div></div>
                      </div>
                    </div>

                    <img src={Arrow} alt="" className="pl-6 md:hidden" />
                  </div>
                </div>
              ) : (
                <></>
              )
            )
          ) : // <div>{stakingData[this.state.tempkey].name}</div>
          stakingData[this.state.tempkey].contractDetails[
              this.props.currentNetworkID
            ] ? (
            <div className="">
              <div className="coin-card-staking-expand mt-10">
                <div className="">
                  <div
                    className="back-container items-center"
                    onClick={() => this.handleCardClose()}
                  >
                    <img
                      src={Close}
                      alt=""
                      className="ml-4 cursor-pointer h-6"
                    />
                    <p className="back-label dark:text-primary">Back</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 justify-between px-4 mt-4">
                  <div className="flex items-center pt-2">
                    <div className="pr-6">
                      {" "}
                      {ReactHtmlParser(
                        stakingData[this.state.tempkey].icon
                      )}{" "}
                    </div>

                    {/* <div dangerouslySetInnerHTML={ stakingData[this.state.tempkey].icon} /> */}
                    <p className="pr-8 font-bold text-primary dark:text-primary">
                      {stakingData[this.state.tempkey].name} <br></br>{" "}
                    </p>
                    {/* <img src={Close} alt="" className="mb-8 ml-24" /> */}
                  </div>
                  <div className="">
                    <p className="text-sm text-primary dark:text-primary staking-key-width">
                      {stakingData[this.state.tempkey].subname === "NORD"
                        ? "APR"
                        : "APY"}{" "}
                      (%)
                    </p>
                    <p className="font-bold text-sm text-primary dark:text-primary">
                      {(this.props.displayData.apy[this.state.tempkey] &&
                      !this.displayEndDate(this.state.tempkey, true)
                        ? displayCommaBalance(
                            this.props.displayData.apy[this.state.tempkey],
                            2
                          )
                        : "0") + "%"}
                    </p>
                  </div>
                  <div className="">
                    <p className="text-sm text-primary dark:text-primary staking-key-width">
                      {(stakingData[this.state.tempkey].subname === "NORD"
                        ? "NORD"
                        : "LP") + " Balance"}
                    </p>
                    <p
                      className="font-bold text-sm text-primary dark:text-primary"
                      title={
                        this.props.web3.utils
                          .toBN(
                            this.props.displayData.tokenBalances[
                              this.state.tempkey
                            ]
                          )
                          .isZero()
                          ? false
                          : this.props.web3.utils.fromWei(
                              this.props.displayData.tokenBalances[
                                this.state.tempkey
                              ],
                              stakingData[this.state.tempkey]
                                .web3EquivalentPrecision
                            ) +
                            " " +
                            stakingData[this.state.tempkey].subname
                      }
                    >
                      {(this.props.displayData.tokenBalances[this.state.tempkey]
                        ? displayBalance(
                            this.props.displayData.tokenBalances[
                              this.state.tempkey
                            ],
                            stakingData[this.state.tempkey]
                              .web3EquivalentPrecision,
                            this.props.web3
                          )
                        : "0") +
                        " " +
                        stakingData[this.state.tempkey].subname}
                    </p>
                  </div>
                  <div className="">
                    <p className="text-sm text-primary dark:text-primary staking-key-width">
                      {(stakingData[this.state.tempkey].subname === "NORD"
                        ? "NORD"
                        : "LP") + " Staked"}
                    </p>
                    <p
                      className="font-bold text-sm text-primary dark:text-primary"
                      title={
                        this.props.web3.utils
                          .toBN(
                            this.props.displayData.stakeBalances[
                              this.state.tempkey
                            ]
                          )
                          .isZero()
                          ? false
                          : this.props.web3.utils.fromWei(
                              this.props.displayData.stakeBalances[
                                this.state.tempkey
                              ],
                              stakingData[this.state.tempkey]
                                .web3EquivalentPrecision
                            ) +
                            " " +
                            stakingData[this.state.tempkey].subname
                      }
                    >
                      {(this.props.displayData.stakeBalances[this.state.tempkey]
                        ? displayBalance(
                            this.props.displayData.stakeBalances[
                              this.state.tempkey
                            ],
                            stakingData[this.state.tempkey]
                              .web3EquivalentPrecision,
                            this.props.web3
                          )
                        : "0") +
                        " " +
                        stakingData[this.state.tempkey].subname}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 coin-card-staking-expand">
                <div className="col-span-1">
                  <div className="flex gap-4 items-center pb-4 ">
                    <p className="font-bold text-primary dark:text-primary">
                      Stake
                    </p>
                    <div>
                      {" "}
                      <label>
                        <input
                          checked={this.state.isChecked}
                          onChange={this._handleStakingChange}
                          className="switch"
                          type="checkbox"
                        />
                        <div>
                          <div></div>
                        </div>
                      </label>
                    </div>
                    <p className="font-bold text-primary dark:text-primary">
                      Unstake
                    </p>
                  </div>

                  <div className="flex justify-between pb-2">
                    <p className="text-sm text-primary dark:text-primary">
                      Nord Stake Value
                    </p>
                    <p
                      className={
                        "text-sm " +
                        ((!this.state.isChecked &&
                          this.displayEndDate(this.state.tempkey, true)) ||
                        this.state.stakingErr
                          ? "tertiary-color pl-7"
                          : "text-primary dark:text-primary pl-5")
                      }
                    >
                      {!this.state.isChecked &&
                      this.displayEndDate(this.state.tempkey, true)
                        ? "The staking period has ended!!!"
                        : this.state.stakingErr
                        ? this.state.stakingErr
                        : "Available " +
                          (stakingData[this.state.tempkey].subname === "NORD"
                            ? "NORD"
                            : "LP") +
                          " : " +
                          (this.state.isChecked
                            ? this.props.displayData.stakeBalances[
                                this.state.tempkey
                              ]
                              ? displayBalance(
                                  this.props.displayData.stakeBalances[
                                    this.state.tempkey
                                  ],
                                  stakingData[this.state.tempkey]
                                    .web3EquivalentPrecision,
                                  this.props.web3,
                                  6
                                )
                              : "0"
                            : this.props.displayData.tokenBalances[
                                this.state.tempkey
                              ]
                            ? displayBalance(
                                this.props.displayData.tokenBalances[
                                  this.state.tempkey
                                ],
                                stakingData[this.state.tempkey]
                                  .web3EquivalentPrecision,
                                this.props.web3,
                                6
                              )
                            : "0") +
                          " " +
                          stakingData[this.state.tempkey].subname}
                    </p>
                  </div>
                  <div>
                    <input
                      className="py-3 px-4 rounded nord-card-input text-primary dark:text-primary"
                      id="staking"
                      type="text"
                      autoFocus
                      placeholder={
                        "Enter " +
                        (this.state.isChecked ? "Unstake" : "Stake") +
                        " value"
                      }
                      value={
                        stakingData[this.state.tempkey].name === "NORD (Old)" &&
                        this.state.isChecked
                          ? this.props.web3.utils.fromWei(
                              this.props.displayData.stakeBalances[
                                this.state.tempkey
                              ],
                              stakingData[this.state.tempkey]
                                .web3EquivalentPrecision
                            )
                          : this.state.stakingAmount
                      }
                      onChange={(e) => this.amountValidation(e)}
                      disabled={
                        (!this.state.isChecked &&
                          this.displayEndDate(this.state.tempkey, true)) ||
                        (stakingData[this.state.tempkey].name ===
                          "NORD (Old)" &&
                          this.state.isChecked)
                      }
                    />
                  </div>
                  <div
                    className={
                      (stakingData[this.state.tempkey].name === "NORD (Old)" &&
                      this.state.isChecked
                        ? "hide"
                        : "show") + " percentage-holder"
                    }
                  >
                    <button
                      className="single-percentage-btn"
                      onClick={() => this._handlePercentageClick(25, 100)}
                    >
                      25%
                    </button>
                    <button
                      className="single-percentage-btn"
                      onClick={() => this._handlePercentageClick(50, 100)}
                    >
                      50%
                    </button>
                    <button
                      className="single-percentage-btn"
                      onClick={() => this._handlePercentageClick(75, 100)}
                    >
                      75%
                    </button>
                    <button
                      className="single-percentage-btn"
                      onClick={() => this._handlePercentageClick(100, 100)}
                    >
                      100%
                    </button>
                  </div>
                  <div className="">
                    <button
                      className=" flex py-2 px-10 justify-between btn-green cursor-pointer focus:outline-none"
                      onClick={() =>
                        this.initiateOperation(
                          this.state.isChecked ? "Unstake" : "Stake"
                        )
                      }
                    >
                      {this.state.isChecked ? "Unstake" : "Stake"}
                    </button>
                  </div>
                  <p
                    className={
                      (stakingData[this.state.tempkey].contractDetails[
                        this.props.currentNetworkID
                      ].unboundingPeriod
                        ? "show"
                        : "hide") + " tertiary-color pt-2"
                    }
                  >
                    {"There is an unbounding period of " +
                      stakingData[this.state.tempkey].contractDetails[
                        this.props.currentNetworkID
                      ].unboundingPeriod}
                  </p>
                </div>

                <div className="col-span-1 ml-12">
                  <div
                    className={
                      "flex gap-2 items-center justify-end " +
                      (stakingData[this.state.tempkey].contractDetails[
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
                  <div className="flex gap-4 py-4 ">
                    <NordBigIcon />
                    <div className=" font-bold pr-6 pt-4">
                      <p className="text-primary dark:text-primary">NORD</p>
                    </div>
                  </div>
                  <div
                    className={
                      (stakingData[this.state.tempkey].subname === "NORD" &&
                      !this.state.isChecked
                        ? "hide "
                        : "") +
                      (stakingData[this.state.tempkey].subname === "NORD"
                        ? "flex gap-8 py-1 pt-2"
                        : "flex gap-16 py-1 pt-2")
                    }
                  >
                    <p className="text-sm text-primary dark:text-primary">
                      {stakingData[this.state.tempkey].subname === "NORD" &&
                      this.state.isChecked
                        ? "Unstaked Balance"
                        : "NORD Balance"}
                    </p>
                    <p
                      className={
                        (stakingData[this.state.tempkey].subname === "NORD" &&
                        this.state.isChecked
                          ? "hide-data "
                          : "") +
                        "text-sm font-bold text-primary dark:text-primary"
                      }
                      title={
                        this.props.nordBalance === "0"
                          ? false
                          : this.props.nordBalance + " NORD"
                      }
                    >
                      {(this.props.nordBalance
                        ? Number(this.props.nordBalance) < 100000
                          ? displayCommaBalance(this.props.nordBalance, 2)
                          : displayAverageBalance(this.props.nordBalance, 2)
                        : "0") + " NORD"}
                    </p>
                    <p
                      className={
                        (stakingData[this.state.tempkey].subname === "NORD" &&
                        this.state.isChecked
                          ? ""
                          : "hide-data ") +
                        "text-sm font-bold text-primary dark:text-primary"
                      }
                      title={
                        this.props.web3.utils
                          .toBN(
                            this.props.displayData.unstakeBalances[
                              this.state.tempkey
                            ]
                          )
                          .isZero()
                          ? false
                          : this.props.web3.utils.fromWei(
                              this.props.displayData.unstakeBalances[
                                this.state.tempkey
                              ],
                              stakingData[this.state.tempkey]
                                .web3EquivalentPrecision
                            ) + " NORD"
                      }
                    >
                      {(this.props.displayData.unstakeBalances[
                        this.state.tempkey
                      ]
                        ? displayBalance(
                            this.props.displayData.unstakeBalances[
                              this.state.tempkey
                            ],
                            stakingData[this.state.tempkey]
                              .web3EquivalentPrecision,
                            this.props.web3
                          )
                        : "0") + " NORD"}
                    </p>
                  </div>
                  <div className="flex gap-10 py-1 pt-2">
                    <p className=" text-sm text-primary dark:text-primary">
                      {stakingData[this.state.tempkey].subname === "NORD" &&
                      this.state.isChecked
                        ? "Unclaimed Stake"
                        : "Unclaimed Reward"}
                    </p>
                    <p
                      className={
                        (stakingData[this.state.tempkey].subname === "NORD" &&
                        this.state.isChecked
                          ? "hide-data "
                          : "") +
                        "text-sm font-bold text-primary dark:text-primary"
                      }
                      title={
                        this.props.web3.utils
                          .toBN(
                            this.props.displayData.earnBalances[
                              this.state.tempkey
                            ]
                          )
                          .isZero()
                          ? false
                          : this.props.web3.utils.fromWei(
                              this.props.displayData.earnBalances[
                                this.state.tempkey
                              ],
                              stakingData[this.state.tempkey]
                                .web3EquivalentPrecision
                            ) + " NORD"
                      }
                    >
                      {(this.props.displayData.earnBalances[this.state.tempkey]
                        ? displayBalance(
                            this.props.displayData.earnBalances[
                              this.state.tempkey
                            ],
                            stakingData[this.state.tempkey]
                              .web3EquivalentPrecision,
                            this.props.web3
                          )
                        : "0") + " NORD"}
                    </p>
                    <p
                      className={
                        (stakingData[this.state.tempkey].subname === "NORD" &&
                        this.state.isChecked
                          ? ""
                          : "hide-data ") +
                        "text-sm font-bold text-primary dark:text-primary"
                      }
                      title={
                        this.props.web3.utils
                          .toBN(
                            this.props.displayData.unclaimedStakeBalances[
                              this.state.tempkey
                            ]
                          )
                          .isZero()
                          ? false
                          : this.props.web3.utils.fromWei(
                              this.props.displayData.unclaimedStakeBalances[
                                this.state.tempkey
                              ],
                              stakingData[this.state.tempkey]
                                .web3EquivalentPrecision
                            ) + " NORD"
                      }
                    >
                      {(this.props.displayData.unclaimedStakeBalances[
                        this.state.tempkey
                      ]
                        ? displayBalance(
                            this.props.displayData.unclaimedStakeBalances[
                              this.state.tempkey
                            ],
                            stakingData[this.state.tempkey]
                              .web3EquivalentPrecision,
                            this.props.web3
                          )
                        : "0") + " NORD"}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      className="py-2 px-10 btn-green cursor-pointer focus:outline-none"
                      onClick={() =>
                        this.executeRewardOperation(
                          stakingData[this.state.tempkey].subname === "NORD" &&
                            this.state.isChecked
                            ? "Stake"
                            : "Earnings Reward"
                        )
                      }
                    >
                      Claim
                    </button>
                    <button
                      className={
                        "py-2 px-7 btn-green cursor-pointer focus:outline-none" +
                        (stakingData[this.state.tempkey].name === "NORD" &&
                        !this.state.isChecked
                          ? ""
                          : " hide-data")
                      }
                      onClick={() => this.executeRewardOperation("Reinvest")}
                    >
                      Reinvest
                    </button>
                  </div>
                  <div
                    className={
                      this.state.isChecked ? "show pr-4 pt-3" : "hide-data"
                    }
                  >
                    <CountdownTimer
                      unstakeTimeRemaining={this.props.displayData.unstakeTimeRemaining[
                        this.state.tempkey
                      ].toString()}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}

          <ConfirmModal
            amount={this.state.stakingAmount}
            isConfirmPopupOpen={this.state.isConfirmPopupOpen}
            confirmPopupType={this.state.isChecked ? "Unstake" : "Stake"}
            selectedToken={
              this.state.tempkey !== null
                ? stakingData[this.state.tempkey].subname
                : ""
            }
            nordData={[]}
            withdrawFee={"0"}
            secondLine={
              this.state.tempkey !== null
                ? ["Staking Token", stakingData[this.state.tempkey].name]
                : []
            }
            displayInfiniteSwitch={[this.state.displayInfiniteSwitch]}
            infiniteApproval={this.state.infiniteApproval}
            handleChange={this._handleInfiniteApprovalChange}
            handlePopupClose={this.handlePopupClose}
          />
        </div>
        <p className="unavailable ml-8">
          {networkData.showStaking[this.props.currentNetworkID]
            ? ""
            : "Coming soon on " +
              networkData.networkName[this.props.currentNetworkID]}
        </p>
      </>
    );
  }
}
Staking.propTypes = {
  web3: PropTypes.object.isRequired,
  web3Biconomy: PropTypes.object.isRequired,
  biconomy: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  displayData: PropTypes.object.isRequired,
  nordBalance: PropTypes.string.isRequired,
  currentNetworkID: PropTypes.number.isRequired,
  showErrorMessage: PropTypes.instanceOf(Promise),
  showSuccessMessage: PropTypes.instanceOf(Promise),
  displayCardClickError: PropTypes.instanceOf(Promise),
  setOverlay: PropTypes.instanceOf(Promise),
  updateBalance: PropTypes.instanceOf(Promise),
};

export default Staking;
