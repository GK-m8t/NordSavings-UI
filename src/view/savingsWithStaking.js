import React, { Component } from "react";
import { NordSmallIcon, Gasless } from "../components/icon/icon";
import LeftArrow from "../assets/images/back.svg";
import Info from "../assets/images/info.svg";
import ConfirmModal from "../components/confirmModal";
import {
  vaultData,
  nordGovernanceTokenData,
  tierAPYBoostDetails,
} from "../config/config";
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
} from "../components/transactionOperations";
import { approveWithBiconomy } from "../components/biconomyApproval";
import CountdownTimer from "../components/countdownTimer";
import PropTypes from "prop-types";
import Bronze from "../assets/images/bronze.svg";
import Silver from "../assets/images/silver.svg";
import Gold from "../assets/images/gold.svg";
import Platinum from "../assets/images/platinum.svg";
import Titanium from "../assets/images/titanium.svg";

// import Layout from "../Layout";

class SavingsWithStaking extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tempkey: null,
      tokenAmount: "",
      tokenErr: "",
      nordAmount: "",
      nordErr: "",
      isChecked: false,
      isGasless: true,
      infiniteApproval: true,
      nordInfiniteApproval: true,
      displayInfiniteSwitch: [],
      isConfirmPopupOpen: false,
      bonusAPY: tierAPYBoostDetails.Bronze,
      bonusTier: "Bronze",
      currentTierForUser: "Bronze",
    };
  }

  amountValidation = async (event, tokenDepositFlag) => {
    const amt = await inputCheck(
      event,
      tokenDepositFlag
        ? vaultData[this.state.tempkey].precision
        : nordGovernanceTokenData.precision
    );
    if (amt !== "invalid") {
      const bal = !this.state.isChecked
        ? tokenDepositFlag
          ? this.props.depositBalance[this.state.tempkey]
          : this.props.nordBalance
        : this.props.withdrawBalance[this.state.tempkey];
      const error = await balanceCheck(
        amt,
        bal,
        tokenDepositFlag ? vaultData[this.state.tempkey].subname : "NORD",
        tokenDepositFlag
          ? vaultData[this.state.tempkey].web3EquivalentPrecision
          : nordGovernanceTokenData.web3EquivalentPrecision,
        this.props.web3
      );
      if (tokenDepositFlag) {
        await this.setState(() => {
          return { tokenAmount: amt, tokenErr: error };
        });
      } else {
        await this.setState(() => {
          return { nordAmount: amt, nordErr: error };
        });
        this.calculateBonusAPY();
      }
    }
  };

  calculateBonusAPY = async () => {
    const amountToStake = this.props.web3.utils.toBN(
      this.props.web3.utils.toWei(
        this.state.nordAmount ? this.state.nordAmount : "0",
        nordGovernanceTokenData.web3EquivalentPrecision
      )
    );

    const totalAmountWithCurrentStake =
      this.props.stakedNordInVault.length && this.state.tempkey !== null
        ? amountToStake.add(this.props.stakedNordInVault[this.state.tempkey])
        : amountToStake;

    const tier = this.getUserTierFromBalance(totalAmountWithCurrentStake);
    this.setState(() => {
      return {
        bonusAPY: tierAPYBoostDetails[tier],
        bonusTier: tier,
      };
    });
  };

  initiateOperation = async (inputType) => {
    const amt = [this.state.tokenAmount];
    const displaySwitch = [false];
    const bal = this.state.isChecked
      ? [this.props.withdrawBalance[this.state.tempkey]]
      : [this.props.depositBalance[this.state.tempkey]];
    const error = [""];
    if (Number(this.state.nordAmount)) {
      amt.push(this.state.nordAmount);
      displaySwitch.push(false);
      bal.push(this.props.nordBalance);
      error.push("");
    }
    let index;
    for (index in amt) {
      error[index] = await balanceCheck(
        amt[index],
        bal[index],
        index === "0" ? vaultData[this.state.tempkey].subname : "NORD",
        index === "0"
          ? vaultData[this.state.tempkey].web3EquivalentPrecision
          : nordGovernanceTokenData.web3EquivalentPrecision,
        this.props.web3
      );
      if (!error[index]) {
        if (!Number(amt[index])) {
          if (index === "0") {
            error[index] = "Please enter a valid " + inputType + " amount!!!";
          }
        } else {
          amt[index] =
            amt[index].substring(0, amt[index].length - 1) +
            amt[index]
              .substring(amt[index].length - 1, amt[index].length)
              .replace(".", "");
          if (!this.state.isChecked) {
            const approve = new this.props.web3.eth.Contract(
              index === "0"
                ? vaultData[this.state.tempkey].contractDetails[
                    this.props.currentNetworkID
                  ].tokenABI.abi
                : nordGovernanceTokenData.contractDetails[
                    this.props.currentNetworkID
                  ].nordTokenABI.abi,
              index === "0"
                ? vaultData[this.state.tempkey].contractDetails[
                    this.props.currentNetworkID
                  ].tokenAddress
                : nordGovernanceTokenData.contractDetails[
                    this.props.currentNetworkID
                  ].nordTokenAddress
            );
            displaySwitch[index] = await claimCheck(
              amt[index],
              approve,
              this.props.accounts[0],
              index === "0"
                ? vaultData[this.state.tempkey].contractDetails[
                    this.props.currentNetworkID
                  ].vaultAddress
                : vaultData[this.state.tempkey].contractDetails[
                    this.props.currentNetworkID
                  ].vaultStakingAddress,
              index === "0"
                ? vaultData[this.state.tempkey].web3EquivalentPrecision
                : nordGovernanceTokenData.web3EquivalentPrecision,
              this.props.web3
            );
          }
        }
      }
    }
    await this.setState(() => {
      return {
        tokenAmount: amt[0],
        tokenErr: error[0],
        nordAmount: amt[1] ? amt[1] : "0",
        nordErr: error[1] ? error[1] : "",
        displayInfiniteSwitch: displaySwitch,
      };
    });
    if (!this.state.tokenErr && !this.state.nordErr) {
      this.openConfirmationPopup();
    }
  };

  executeApproveOperation = async () => {
    const amt = [
      this.props.web3.utils.toBN(
        this.props.web3.utils.toWei(
          this.state.tokenAmount,
          vaultData[this.state.tempkey].web3EquivalentPrecision
        )
      ),
    ];
    const approveFlag = [false];
    if (Number(this.state.nordAmount)) {
      approveFlag.push(false);
      amt.push(
        this.props.web3.utils.toBN(
          this.props.web3.utils.toWei(
            this.state.nordAmount,
            nordGovernanceTokenData.web3EquivalentPrecision
          )
        )
      );
    }
    let index;
    for (index in amt) {
      const approveOperation = new (
        vaultData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy && this.state.isGasless
          ? this.props.web3Biconomy
          : this.props.web3
      ).eth.Contract(
        index === "0"
          ? vaultData[this.state.tempkey].contractDetails[
              this.props.currentNetworkID
            ].tokenABI.abi
          : nordGovernanceTokenData.contractDetails[this.props.currentNetworkID]
              .nordTokenABI.abi,
        index === "0"
          ? vaultData[this.state.tempkey].contractDetails[
              this.props.currentNetworkID
            ].tokenAddress
          : nordGovernanceTokenData.contractDetails[this.props.currentNetworkID]
              .nordTokenAddress
      );
      if (this.state.displayInfiniteSwitch[index]) {
        if (
          index === "0"
            ? this.state.infiniteApproval
            : this.state.nordInfiniteApproval
        ) {
          amt[index] = this.props.web3.utils.toBN(
            "115792089237316195423570985008687907853269984665640564039457584007913129639935"
          );
          this.props.setOverlay(
            true,
            "Waiting for Infinite " +
              (index === "0" ? vaultData[this.state.tempkey].subname : "NORD") +
              " Allowance Approval",
            ""
          );
          if (
            vaultData[this.state.tempkey].contractDetails[
              this.props.currentNetworkID
            ].enableBiconomy &&
            this.state.isGasless
          ) {
            approveFlag[index] = await approveWithBiconomy(
              this.props.setOverlay,
              approveOperation,
              index === "0"
                ? [
                    vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].tokenName,
                    vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].tokenAddress,
                    vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].eipVersion,
                    this.props.currentNetworkID,
                  ]
                : [
                    nordGovernanceTokenData.contractDetails[
                      this.props.currentNetworkID
                    ].tokenName,
                    nordGovernanceTokenData.contractDetails[
                      this.props.currentNetworkID
                    ].nordTokenAddress,
                    nordGovernanceTokenData.contractDetails[
                      this.props.currentNetworkID
                    ].eipVersion,
                    this.props.currentNetworkID,
                  ],
              this.props.accounts[0],
              this.props.web3Biconomy,
              [
                index === "0"
                  ? vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].vaultAddress
                  : vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].vaultStakingAddress,
                amt[index],
              ]
            );
          } else {
            approveFlag[index] = await contractOperation(
              this.props.setOverlay,
              approveOperation,
              "approve",
              this.props.accounts[0],
              [
                index === "0"
                  ? vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].vaultAddress
                  : vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].vaultStakingAddress,
                amt[index],
              ]
            );
          }
          if (approveFlag[index]) {
            this.props.showSuccessMessage(
              vaultData[this.state.tempkey].ntokenname +
                " Contract is trusted now for " +
                (index === "0"
                  ? vaultData[this.state.tempkey].subname
                  : "NORD") +
                " deposits!"
            );
          } else {
            this.props.showErrorMessage(
              "Failed to trust " +
                vaultData[this.state.tempkey].ntokenname +
                " Contract for " +
                (index === "0"
                  ? vaultData[this.state.tempkey].subname
                  : "NORD") +
                " deposits!"
            );
            break;
          }
        } else {
          this.props.setOverlay(
            true,
            "Waiting for allowance approval of " +
              displayCommaBalance(
                Math.trunc(
                  Number(
                    index === "0"
                      ? this.state.tokenAmount
                      : this.state.nordAmount
                  ) * 10000
                ) / 10000,
                4
              ) +
              " " +
              (index === "0" ? vaultData[this.state.tempkey].subname : "NORD"),
            ""
          );
          if (
            vaultData[this.state.tempkey].contractDetails[
              this.props.currentNetworkID
            ].enableBiconomy &&
            this.state.isGasless
          ) {
            approveFlag[index] = await approveWithBiconomy(
              this.props.setOverlay,
              approveOperation,
              index === "0"
                ? [
                    vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].tokenName,
                    vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].tokenAddress,
                    vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].eipVersion,
                    this.props.currentNetworkID,
                  ]
                : [
                    nordGovernanceTokenData.contractDetails[
                      this.props.currentNetworkID
                    ].tokenName,
                    nordGovernanceTokenData.contractDetails[
                      this.props.currentNetworkID
                    ].nordTokenAddress,
                    nordGovernanceTokenData.contractDetails[
                      this.props.currentNetworkID
                    ].eipVersion,
                    this.props.currentNetworkID,
                  ],
              this.props.accounts[0],
              this.props.web3Biconomy,
              [
                index === "0"
                  ? vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].vaultAddress
                  : vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].vaultStakingAddress,
                amt[index],
              ]
            );
          } else {
            approveFlag[index] = await contractOperation(
              this.props.setOverlay,
              approveOperation,
              "approve",
              this.props.accounts[0],
              [
                index === "0"
                  ? vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].vaultAddress
                  : vaultData[this.state.tempkey].contractDetails[
                      this.props.currentNetworkID
                    ].vaultStakingAddress,
                amt[index],
              ]
            );
          }
          if (approveFlag[index]) {
            this.props.showSuccessMessage(
              displayCommaBalance(
                Math.trunc(
                  Number(
                    index === "0"
                      ? this.state.tokenAmount
                      : this.state.nordAmount
                  ) * 10000
                ) / 10000,
                4
              ) +
                " " +
                (index === "0"
                  ? vaultData[this.state.tempkey].subname
                  : "NORD") +
                " has been successfully approved for deposit transfer!"
            );
          } else {
            this.props.showErrorMessage(
              "Failed to approve transfer of " +
                displayCommaBalance(
                  Math.trunc(
                    Number(
                      index === "0"
                        ? this.state.tokenAmount
                        : this.state.nordAmount
                    ) * 10000
                  ) / 10000,
                  4
                ) +
                " " +
                (index === "0"
                  ? vaultData[this.state.tempkey].subname
                  : "NORD") +
                "!"
            );
            break;
          }
        }
      } else {
        approveFlag[index] = true;
        this.props.showSuccessMessage(
          displayCommaBalance(
            Math.trunc(
              Number(
                index === "0" ? this.state.tokenAmount : this.state.nordAmount
              ) * 10000
            ) / 10000,
            4
          ) +
            " " +
            (index === "0" ? vaultData[this.state.tempkey].subname : "NORD") +
            " has already been pre-approved for deposit transfer!"
        );
      }
    }
    if (
      approveFlag.every((check) => {
        return check === true;
      })
    ) {
      this.executeSavingsOperation("Deposit");
    }
  };

  executeSavingsOperation = async (inputType) => {
    let savingsOperationFlag = false;
    const savingsOperation = new (
      vaultData[this.state.tempkey].contractDetails[this.props.currentNetworkID]
        .enableBiconomy && this.state.isGasless
        ? this.props.web3Biconomy
        : this.props.web3
    ).eth.Contract(
      vaultData[this.state.tempkey].contractDetails[
        this.props.currentNetworkID
      ].vaultABI.abi,
      vaultData[this.state.tempkey].contractDetails[
        this.props.currentNetworkID
      ].vaultAddress
    );
    this.props.setOverlay(true, inputType + "ing...", "");
    const amt = [];
    if (!this.state.isChecked) {
      amt.push(
        this.props.web3.utils.toBN(
          this.props.web3.utils.toWei(
            this.state.nordAmount,
            nordGovernanceTokenData.web3EquivalentPrecision
          )
        )
      );
    } else {
      amt.push(0);
    }

    amt.push(
      this.props.web3.utils.toBN(
        this.props.web3.utils.toWei(
          this.state.tokenAmount,
          vaultData[this.state.tempkey].web3EquivalentPrecision
        )
      )
    );
    if (
      vaultData[this.state.tempkey].contractDetails[this.props.currentNetworkID]
        .enableBiconomy &&
      this.state.isGasless
    ) {
      savingsOperationFlag = await contractOperationWithBiconomy(
        this.props.setOverlay,
        savingsOperation,
        inputType.toLowerCase(),
        this.props.accounts[0],
        this.props.biconomy,
        amt
      );
    } else {
      savingsOperationFlag = await contractOperation(
        this.props.setOverlay,
        savingsOperation,
        inputType.toLowerCase(),
        this.props.accounts[0],
        amt
      );
    }
    if (savingsOperationFlag) {
      this.props.showSuccessMessage(
        this.state.tokenAmount +
          " " +
          (inputType === "Deposit"
            ? vaultData[this.state.tempkey].subname
            : vaultData[this.state.tempkey].ntokenname) +
          " has been successfully " +
          inputType.toLowerCase() +
          (inputType === "Withdraw" ? "n" : "ed")
      );
      this.resetInput();
      this.updateBalanceAfterTx();
    } else {
      this.props.showErrorMessage(
        "Failed to " +
          inputType.toLowerCase() +
          " " +
          this.state.tokenAmount +
          " " +
          (inputType === "Deposit"
            ? vaultData[this.state.tempkey].subname
            : vaultData[this.state.tempkey].ntokenname)
      );
    }
  };

  executeNordVaultClaim = async () => {
    if (this.canUserClaimUnstakedAmount()) {
      let claimOperationFlag = false;
      const claimUnstakedNordOperation = new (
        vaultData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy && this.state.isGasless
          ? this.props.web3Biconomy
          : this.props.web3
      ).eth.Contract(
        vaultData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].vaultStakingABI.abi,
        vaultData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].vaultStakingAddress
      );
      this.props.setOverlay(true, "Claiming Unstaked NORD Amount...", "");
      if (
        vaultData[this.state.tempkey].contractDetails[
          this.props.currentNetworkID
        ].enableBiconomy &&
        this.state.isGasless
      ) {
        claimOperationFlag = await contractOperationWithBiconomy(
          this.props.setOverlay,
          claimUnstakedNordOperation,
          "claimUnstakedAmount",
          this.props.accounts[0],
          this.props.biconomy,
          [this.props.accounts[0]]
        );
      } else {
        claimOperationFlag = await contractOperation(
          this.props.setOverlay,
          claimUnstakedNordOperation,
          "claimUnstakedAmount",
          this.props.accounts[0],
          [this.props.accounts[0]]
        );
      }
      if (claimOperationFlag) {
        this.props.showSuccessMessage("Successfully claimed staked NORD");
        this.updateBalanceAfterTx();
      } else {
        this.props.showErrorMessage("Failed to claim staked NORD");
      }
    } else {
      this.props.showErrorMessage("No staked NORD Depsoit Available to claim");
    }
  };

  updateBalanceAfterTx = async () => {
    this.props.setOverlay(true, "Updating Balance...", "");
    await this.props.updateBalance();
    this.props.setOverlay(false, "", "");
  };

  openConfirmationPopup = () => {
    this.setState({
      isConfirmPopupOpen: `true`,
    });
  };

  handlePopupClose = async (confirm) => {
    this.setState({
      isConfirmPopupOpen: false,
    });
    if (confirm) {
      if (this.state.isChecked) {
        this.executeSavingsOperation("Withdraw");
      } else {
        this.executeApproveOperation();
      }
    } else {
      const orderType = this.state.isChecked ? "Withdrawal" : "Deposit";
      this.props.showErrorMessage(orderType + " Order Cancelled!");
    }
  };

  _handlePercentageClick = async (numerator, denominator, tokenInputFlag) => {
    const bal = !this.state.isChecked
      ? tokenInputFlag
        ? this.props.depositBalance[this.state.tempkey]
        : this.props.nordBalance
      : this.props.withdrawBalance[this.state.tempkey];
    const amt = await amountFraction(
      bal,
      numerator,
      denominator,
      tokenInputFlag
        ? vaultData[this.state.tempkey].web3EquivalentPrecision
        : nordGovernanceTokenData.web3EquivalentPrecision,
      this.props.web3
    );
    if (tokenInputFlag) {
      await this.setState(() => {
        return { tokenAmount: amt, tokenErr: "" };
      });
    } else {
      await this.setState(() => {
        return { nordAmount: amt, nordErr: "" };
      });
      this.calculateBonusAPY();
    }
  };

  resetInput = () => {
    this.setState({
      tokenAmount: "",
      tokenErr: "",
      nordAmount: "",
      nordErr: "",
    });
  };

  _handleSavingsChange = async () => {
    this.setState({
      isChecked: !this.state.isChecked,
    });
    await this.resetInput();
    this.calculateBonusAPY();
  };

  _handleBiconomyGaslessChange = () => {
    this.setState({
      isGasless: !this.state.isGasless,
    });
  };

  _handleInfiniteApprovalChange = (tokenApprovalFlag) => {
    if (tokenApprovalFlag) {
      this.setState({
        infiniteApproval: !this.state.infiniteApproval,
      });
    } else {
      this.setState({
        nordInfiniteApproval: !this.state.nordInfiniteApproval,
      });
    }
  };

  OnActive = (id) => {
    if (!this.props.accounts[0]) {
      this.props.displayCardClickError();
    } else {
      this.setState(
        {
          tempkey: id,
        },
        () => {
          this.calculateBonusAPY();
        }
      );
    }
  };

  OnBack = () => {
    this.setState({
      tempkey: null,
      isChecked: false,
    });
    this.resetInput();
  };

  calculateTotalRewards = () => {
    if (this.state.isChecked) {
      return 0;
    }
    const baseReward = this.props.vaultApy[this.state.tempkey]
      ? (this.sanitiseComma(this.props.vaultApy[this.state.tempkey]) *
          this.state.tokenAmount) /
        100
      : 0;
    const bonusAPY = this.state.tokenAmount
      ? (this.state.tokenAmount * this.state.bonusAPY) / 100
      : 0;
    const nordAPY =
      this.props.nordPrice && this.state.nordAmount
        ? (this.state.bonusAPY * this.state.nordAmount * this.props.nordPrice) /
          100
        : 0;

    return baseReward + bonusAPY + nordAPY;
  };

  canUserClaimUnstakedAmount = () => {
    return (
      this.hasUnclaimedStakedAmount() &&
      this.props.unclaimedBal[this.state.tempkey].unstakingTime.toString() <
        Math.round(Date.now() / 1000).toString()
    );
  };

  hasUnclaimedStakedAmount = () => {
    return this.props.unclaimedBal[this.state.tempkey].unstakingAmount !== "0";
  };

  getTierLogoFromTier = (tier) => {
    let tierLogo = Bronze;
    switch (tier) {
      case "Titanium":
        tierLogo = Titanium;
        break;
      case "Platinum":
        tierLogo = Platinum;
        break;
      case "Gold":
        tierLogo = Gold;
        break;
      case "Silver":
        tierLogo = Silver;
        break;
      default:
        tierLogo = Bronze;
        break;
    }
    return tierLogo;
  };

  getWithdrawFee = () => {
    if (
      this.state.tempkey === null ||
      !this.state.isChecked ||
      !Number(this.state.tokenAmount)
    ) {
      return "0";
    }
    const amount = this.props.calculateReceivingAmount(
      this.state.tempkey,
      this.state.tokenAmount
    );
    return (0.01 * amount).toString();
  };

  getTotalStableTokensEarned = (amt, isTooltip) => {
    if (this.state.tempkey === null || !Number(amt)) {
      return "0";
    }
    const amount = this.props.calculateReceivingAmount(this.state.tempkey, amt);

    if (isTooltip) {
      return amount;
    }

    return Number(amount) < 100000
      ? displayCommaBalance(amount, 2)
      : displayAverageBalance(amount, 2);
  };

  getUserTierFromBalance = (stakedAmount) => {
    let tier = "";
    switch (true) {
      case stakedAmount.lt(
        this.props.web3.utils.toBN(
          this.props.web3.utils.toWei(
            "1000",
            nordGovernanceTokenData.web3EquivalentPrecision
          )
        )
      ):
        tier = "Bronze";
        break;
      case stakedAmount.lt(
        this.props.web3.utils.toBN(
          this.props.web3.utils.toWei(
            "1500",
            nordGovernanceTokenData.web3EquivalentPrecision
          )
        )
      ):
        tier = "Silver";
        break;
      case stakedAmount.lt(
        this.props.web3.utils.toBN(
          this.props.web3.utils.toWei(
            "2500",
            nordGovernanceTokenData.web3EquivalentPrecision
          )
        )
      ):
        tier = "Gold";
        break;
      case stakedAmount.lt(
        this.props.web3.utils.toBN(
          this.props.web3.utils.toWei(
            "3500",
            nordGovernanceTokenData.web3EquivalentPrecision
          )
        )
      ):
        tier = "Platinum";
        break;
      default:
        tier = "Titanium";
        break;
    }

    return tier;
  };

  getAvailableStableTokenBalanceToDisplay = () => {
    if (this.state.isChecked) {
      return (
        (Number(this.props.withdrawBalance[this.state.tempkey])
          ? displayBalance(
              this.props.withdrawBalance[this.state.tempkey],
              vaultData[this.state.tempkey].web3EquivalentPrecision,
              this.props.web3
            )
          : "0") +
        " " +
        vaultData[this.state.tempkey].ntokenname
      );
    }

    return (
      (Number(this.props.depositBalance[this.state.tempkey])
        ? displayBalance(
            this.props.depositBalance[this.state.tempkey],
            vaultData[this.state.tempkey].web3EquivalentPrecision,
            this.props.web3
          )
        : "0") +
      " " +
      vaultData[this.state.tempkey].subname
    );
  };

  getAvailableNordBalanceToDisplay = () => {
    return (
      (Number(this.props.nordBalance)
        ? displayBalance(
            this.props.nordBalance,
            nordGovernanceTokenData.web3EquivalentPrecision,
            this.props.web3
          )
        : "0") + " NORD"
    );
  };

  getStakedNordBalanceToDisplay = () => {
    return Number(this.props.stakedNordInVault[this.state.tempkey])
      ? displayBalance(
          this.props.stakedNordInVault[this.state.tempkey],
          nordGovernanceTokenData.web3EquivalentPrecision,
          this.props.web3
        )
      : "0";
  };

  isCalculatorTier = (tier) => {
    return this.state.bonusTier === tier;
  };

  sanitiseComma = (apy) => {
    return apy.replace(/,/g, "");
  };

  is100PercentageWithdrawal = () => {
    // TODO : to handle a scenario where there's a traling 0
    if (!Number(this.state.tokenAmount)) {
      return false;
    }
    return this.props.withdrawBalance[this.state.tempkey].eq(
      this.props.web3.utils.toBN(
        this.props.web3.utils.toWei(
          this.state.tokenAmount,
          vaultData[this.state.tempkey].web3EquivalentPrecision
        )
      )
    );
  };

  render() {
    return (
      <>
        <div className=" container mx-auto lg:px-32 md:px-10">
          {this.state.tempkey === null ? (
            <div className="">
              {vaultData.map((item, index) =>
                item.contractDetails[this.props.currentNetworkID] ? (
                  <div
                    className="card-coin cursor-pointer flex justify-between "
                    key={index}
                    onClick={() => this.OnActive(index)}
                  >
                    <div className="flex gap-4 w-1/4">
                      <img src={item.icon} alt="" className="" />{" "}
                      <div className="">
                        <h3 className="font-bold text-primary dark:text-primary">
                          {item.name}
                        </h3>
                        <h5 className="text-primary dark:text-primary text-sm">
                          {item.subname}
                        </h5>
                      </div>
                    </div>

                    <div className="">
                      <h6 className="text-sm text-primary dark:text-primary">
                        Reward APY
                        <div className="tooltip">
                          <img
                            src={Info}
                            alt=""
                            className="mb-1 ml-1 h-3 w-3 cursor-pointer"
                          />
                          <span className="tooltiptext">
                            <p className="mx-5 text-left ">
                              {`Earn upto 21.9% additional APY with Titanium Tier.`}
                            </p>
                          </span>
                        </div>
                      </h6>
                      <h5 className="font-bold text-primary dark:text-primary">
                        {`${
                          item.contractDetails[this.props.currentNetworkID]
                            .nordAPY
                            ? item.contractDetails[this.props.currentNetworkID]
                                .nordAPY
                            : "0"
                        } %`}
                      </h5>
                    </div>
                    <div className="">
                      <h6 className="text-sm text-primary dark:text-primary">
                        Base APY
                      </h6>
                      <h5 className="font-bold text-primary dark:text-primary">
                        {`${
                          this.props.vaultApy[index]
                            ? this.props.vaultApy[index]
                            : "0"
                        } %`}
                      </h5>
                    </div>
                    <div className="">
                      <h6 className="text-sm text-primary dark:text-primary">
                        {item.subname + " BAL"}
                      </h6>
                      <h5 className="font-bold text-primary dark:text-primary">
                        {(Number(this.props.depositBalance[index])
                          ? displayBalance(
                              this.props.depositBalance[index],
                              item.web3EquivalentPrecision,
                              this.props.web3
                            )
                          : "0") +
                          " " +
                          item.subname}
                      </h5>
                    </div>
                    <div className="">
                      <h6 className="text-sm text-primary dark:text-primary">
                        {item.ntokenname + " BAL"}
                      </h6>
                      <h5 className="font-bold text-primary dark:text-primary">
                        {(Number(this.props.withdrawBalance[index])
                          ? displayBalance(
                              this.props.withdrawBalance[index],
                              item.web3EquivalentPrecision,
                              this.props.web3
                            )
                          : "0") +
                          " " +
                          item.ntokenname}
                      </h5>
                    </div>
                  </div>
                ) : (
                  <></>
                )
              )}
            </div>
          ) : (
            <>
              <div className="lg:flex mg:grid gap-4">
                <div className="lg:w-2/3 md:w-full">
                  <div className="card-coin-polygon">
                    <div className="back-container-biance flex justify-between pb-6">
                      <div
                        className="cursor-pointer flex gap-2 items-center"
                        onClick={() => this.OnBack()}
                      >
                        <img src={LeftArrow} alt="" className="h-6" />
                        <p className="back-label dark:text-primary font-bold">
                          Back
                        </p>
                      </div>
                      <div className="flex gap-2 items-center tier">
                        <img
                          src={this.getTierLogoFromTier(
                            this.getUserTierFromBalance(
                              this.props.stakedNordInVault[this.state.tempkey]
                            )
                          )}
                          alt="level-icon"
                          className="h-5"
                        />
                        <p className="text-primary dark:text-primary font-normal">
                          {this.getUserTierFromBalance(
                            this.props.stakedNordInVault[this.state.tempkey]
                          ) +
                            " (" +
                            this.getStakedNordBalanceToDisplay() +
                            " NORD)"}
                        </p>
                      </div>
                    </div>
                    <div className="flex py-4 gap-2 justify-between">
                      <div>
                        <div className="flex gap-4 cursor-default">
                          <img
                            src={vaultData[this.state.tempkey].icon}
                            alt=""
                            className="h-12"
                          />
                          <div>
                            <p className="font-bold text-primary dark:text-primary">
                              {vaultData[this.state.tempkey].subname} Coin
                            </p>
                            <p className="text-xs text-primary dark:text-primary">
                              {vaultData[this.state.tempkey].subname}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-10">
                        <h3 className="text-primary dark:text-primary font-bold">
                          Portfolio:
                        </h3>
                        <div className="gap-2 cursor-default items-center">
                          <p
                            className="text-primary dark:text-primary pb-1"
                            title={this.getTotalStableTokensEarned(
                              this.props.web3.utils.fromWei(
                                this.props.withdrawBalance[this.state.tempkey],
                                vaultData[this.state.tempkey]
                                  .web3EquivalentPrecision
                              ),
                              true
                            )}
                          >
                            {`${this.getTotalStableTokensEarned(
                              this.props.web3.utils.fromWei(
                                this.props.withdrawBalance[this.state.tempkey],
                                vaultData[this.state.tempkey]
                                  .web3EquivalentPrecision
                              )
                            )} `}
                          </p>
                          <div className="flex gap-2">
                            <img
                              src={vaultData[this.state.tempkey].icon}
                              alt=""
                              className="h-5"
                            />
                            <p className="text-sm text-primary dark:text-primary">
                              {vaultData[this.state.tempkey].subname}
                            </p>
                          </div>
                        </div>
                        <div className="cursor-default">
                          <p
                            className="text-primary dark:text-primary pb-1"
                            title={
                              this.props.earnedNordInVault[this.state.tempkey]
                            }
                          >
                            {Number(
                              this.props.earnedNordInVault[this.state.tempkey]
                            ) < 100000
                              ? displayCommaBalance(
                                  this.props.earnedNordInVault[
                                    this.state.tempkey
                                  ],
                                  3
                                )
                              : displayAverageBalance(
                                  this.props.earnedNordInVault[
                                    this.state.tempkey
                                  ],
                                  3
                                )}{" "}
                          </p>
                          <div className="flex gap-2">
                            <NordSmallIcon />
                            <p className="text-sm text-primary dark:text-primary">
                              NORD
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* <button className="flex binance-tab py-3 px-2 gap-2">
                        <img src={ETH} alt="" className="h-6" /> ETH
                      </button> */}
                    </div>
                  </div>
                  <div className="card-coin-polygon">
                    <div className="flex justify-between">
                      <div className="flex gap-4 items-center">
                        <p className="font-bold text-primary dark:text-primary">
                          Deposit
                        </p>
                        <div>
                          <label>
                            <input
                              checked={this.state.isChecked}
                              onChange={this._handleSavingsChange}
                              className="switch"
                              type="checkbox"
                            />
                            <div>
                              <div></div>
                            </div>
                          </label>
                        </div>
                        <p className="font-bold text-primary dark:text-primary">
                          Withdraw
                        </p>
                      </div>
                      <div
                        className={
                          "flex gap-2 items-center " +
                          (vaultData[this.state.tempkey].contractDetails[
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
                    <div className="grid grid-cols-2 gap-6 mt-5">
                      <div className="col-span-1">
                        <div>
                          <label className="pb-2 text-primary dark:text-primary">
                            {" "}
                            {"Amount " +
                              (this.state.isChecked
                                ? "to Withdraw"
                                : "to Invest")}
                          </label>
                          <input
                            className="py-3 px-4 rounded nord-card-input text-primary dark:text-primary"
                            id="tokenInput"
                            type="text"
                            autoFocus
                            placeholder={`Enter ${
                              this.state.isChecked
                                ? vaultData[this.state.tempkey].ntokenname +
                                  " withdrawal"
                                : vaultData[this.state.tempkey].subname +
                                  " deposit"
                            } amount`}
                            value={this.state.tokenAmount}
                            onChange={(e) => this.amountValidation(e, true)}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-sm py-4 text-primary dark:text-primary ${
                              this.state.tokenErr ? "tertiary-color" : ""
                            } `}
                          >
                            {this.state.tokenErr
                              ? this.state.tokenErr
                              : `Available : ${this.getAvailableStableTokenBalanceToDisplay()}`}
                            <div
                              className={
                                "tooltip " +
                                (this.state.tokenErr ? "hide-data" : "")
                              }
                            >
                              <img
                                src={Info}
                                alt=""
                                className="mb-1 ml-1 h-4 w-3 cursor-pointer"
                              />
                              <span className="tooltiptext">
                                <p className="mx-5 text-left text-primary dark:text-primary ">
                                  {this.state.isChecked
                                    ? `When you withdraw ${
                                        vaultData[this.state.tempkey].ntokenname
                                      }, you will receive the withdrawn ${
                                        vaultData[this.state.tempkey].subname
                                      } along with the interest accrued`
                                    : `When you deposit ${
                                        vaultData[this.state.tempkey].subname
                                      }, you will receive interest accumulating tokens known as  ${
                                        vaultData[this.state.tempkey].ntokenname
                                      }`}
                                </p>
                              </span>
                            </div>
                          </p>
                        </div>
                        <div className="">
                          <button
                            className="single-percentage-btn"
                            onClick={() =>
                              this._handlePercentageClick(25, 100, true)
                            }
                          >
                            25%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() =>
                              this._handlePercentageClick(50, 100, true)
                            }
                          >
                            50%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() =>
                              this._handlePercentageClick(75, 100, true)
                            }
                          >
                            75%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() =>
                              this._handlePercentageClick(100, 100, true)
                            }
                          >
                            100%
                          </button>
                        </div>
                      </div>
                      <div className="col-span-1">
                        <label className="pb-2 text-primary dark:text-primary ">
                          {" "}
                          {!this.state.isChecked
                            ? "Nord Tokens"
                            : "Unclaimed NORD"}{" "}
                        </label>
                        <div
                          className={
                            "tooltip " +
                            (this.state.isChecked ? "" : "hide-data")
                          }
                        >
                          <img
                            src={Info}
                            alt=""
                            className="mb-1 ml-1 h-4 w-4 cursor-pointer"
                          />
                          <span className="tooltiptext">
                            <p className="mx-5 text-left text-primary dark:text-primary ">
                              {`When withdrawing 100% of ${
                                vaultData[this.state.tempkey].subname
                              } Deposits, The staked NORD automatically will be unstaked and available for claiming`}
                            </p>
                          </span>
                        </div>
                        <br />
                        <input
                          className="py-3 px-4 rounded nord-card-input text-primary dark:text-primary"
                          id="tokenInput"
                          type="text"
                          autoFocus
                          placeholder="Enter NORD deposit amount"
                          value={
                            !this.state.isChecked
                              ? this.state.nordAmount
                              : this.props.unclaimedBal[this.state.tempkey]
                                  .unstakingAmount
                          }
                          onChange={(e) => this.amountValidation(e, false)}
                          disabled={this.state.isChecked}
                        />
                        <div
                          className={
                            this.state.nordErr
                              ? ""
                              : this.state.isChecked
                              ? this.hasUnclaimedStakedAmount() &&
                                !this.canUserClaimUnstakedAmount()
                                ? ""
                                : "hide"
                              : ""
                          }
                        >
                          <p
                            className={`text-sm py-4 text-primary dark:text-primary ${
                              this.state.nordErr ? "tertiary-color" : ""
                            } `}
                          >
                            {this.state.nordErr ? (
                              this.state.nordErr
                            ) : !this.state.isChecked ? (
                              `Available : ${this.getAvailableNordBalanceToDisplay()}`
                            ) : this.hasUnclaimedStakedAmount() &&
                              !this.canUserClaimUnstakedAmount() ? (
                              <CountdownTimer
                                unstakeTimeRemaining={this.props.unclaimedBal[
                                  this.state.tempkey
                                ].unstakingTime.toString()}
                              />
                            ) : (
                              "valid"
                            )}
                          </p>
                        </div>
                        <div
                          className={
                            (!this.state.isChecked ? "" : "hide-data ") + ""
                          }
                        >
                          <button
                            className="single-percentage-btn"
                            onClick={() =>
                              this._handlePercentageClick(25, 100, false)
                            }
                          >
                            25%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() =>
                              this._handlePercentageClick(50, 100, false)
                            }
                          >
                            50%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() =>
                              this._handlePercentageClick(75, 100, false)
                            }
                          >
                            75%
                          </button>
                          <button
                            className="single-percentage-btn"
                            onClick={() =>
                              this._handlePercentageClick(100, 100, false)
                            }
                          >
                            100%
                          </button>
                        </div>
                        <div
                          className={
                            "text-center" +
                            (this.state.isChecked &&
                            this.canUserClaimUnstakedAmount()
                              ? ""
                              : " hide-data")
                          }
                        >
                          <button
                            className="py-2 btn-deposit-biance"
                            onClick={() => this.executeNordVaultClaim()}
                          >
                            Claim
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="">
                      <p
                        className={
                          "mb-2 text-color text-sm text-primary dark:text-primary " +
                          (!this.state.isChecked ||
                          this.state.tokenErr ||
                          !Number(this.state.tokenAmount)
                            ? "hide"
                            : "")
                        }
                      >
                        {"You will receive " +
                          this.getTotalStableTokensEarned(
                            this.state.tokenAmount
                          ) +
                          " " +
                          vaultData[this.state.tempkey].subname +
                          (this.is100PercentageWithdrawal() &&
                          this.getStakedNordBalanceToDisplay() !== "0"
                            ? " and " +
                              this.getStakedNordBalanceToDisplay() +
                              " NORD"
                            : "")}
                      </p>
                      <button
                        className="btn-green py-2 px-12"
                        onClick={() =>
                          this.initiateOperation(
                            !this.state.isChecked ? "Deposit" : "Withdrawal"
                          )
                        }
                      >
                        {!this.state.isChecked ? "Deposit" : "Withdraw"}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-coin-polygon lg:w-1/3 md:w-full ">
                  <div className="mb-12">
                    <h3 className="text-primary dark:text-primary font-semibold text-xl">
                      Nord Reward Calculator
                      <div className="tooltip">
                        <img
                          src={Info}
                          alt=""
                          className="mb-1 ml-1 h-4 w-3 cursor-pointer"
                        />
                        <span className="tooltiptext">
                          <div className="grid grid-cols-3 pt-2 pl-2 pr-2 justify-between gap-4">
                            <p className="text-sm text-primary dark:text-primary text-left">
                              {"Tier"}
                            </p>
                            <p className="text-sm-center text-primary dark:text-primary text-center">
                              {"NORD"}
                            </p>
                            <p className="text-sm-right text-primary dark:text-primary text-right">
                              {"APY Boost"}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 pt-2 pl-2 pr-2 justify-between gap-4">
                            <p className="font-light text-sm-left text-left text-primary dark:text-primary">
                              {"Bronze"}
                            </p>
                            <p className="font-light text-sm-center text-center text-primary dark:text-primary">
                              {"<= 999"}
                            </p>
                            <p className="font-light text-sm-right text-right text-primary dark:text-primary">
                              {"2%"}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 pt-2 pl-2 pr-2 justify-between gap-4">
                            <p className="font-light text-sm-left text-left text-primary dark:text-primary">
                              {"Silver"}
                            </p>
                            <p className="font-light text-sm-center text-center text-primary dark:text-primary">
                              {"<= 1499"}
                            </p>
                            <p className="font-light text-sm-right text-right text-primary dark:text-primary">
                              {"4%"}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 pt-2 pl-2 pr-2 justify-between gap-4">
                            <p className="font-light text-sm-left text-left text-primary dark:text-primary">
                              {"Gold"}
                            </p>
                            <p className="font-light text-sm-center text-center text-primary dark:text-primary">
                              {"<= 2499"}
                            </p>
                            <p className="font-light text-sm-right text-right text-primary dark:text-primary">
                              {"6%"}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 pt-2 pl-2 pr-2 justify-between gap-4">
                            <p className="font-light text-sm-left text-left text-primary dark:text-primary">
                              {"Platinum"}
                            </p>
                            <p className="font-light text-sm-center text-center text-primary dark:text-primary">
                              {"<= 3499"}
                            </p>
                            <p className="font-light text-sm-right text-right text-primary dark:text-primary">
                              {"10%"}
                            </p>
                          </div>
                          <div className="grid grid-cols-3 pt-2 pl-2 pr-2 justify-between gap-4">
                            <p className="font-light text-sm-left text-left text-primary dark:text-primary">
                              {"Titanium"}
                            </p>
                            <p className="font-light text-sm-center text-center text-primary dark:text-primary">
                              {">= 3500"}
                            </p>
                            <p className="font-light text-sm-right text-right text-primary dark:text-primary">
                              {"12.5%"}
                            </p>
                          </div>
                        </span>
                      </div>
                    </h3>
                  </div>
                  <hr className="calculator-hr"></hr>
                  <div className="flex justify-between my-4">
                    <h5 className="text-primary dark:text-primary">
                      {" "}
                      Reward Tier{" "}
                    </h5>

                    <div className="flex gap-4">
                      <img
                        src={this.getTierLogoFromTier(this.state.bonusTier)}
                        alt=""
                        className="h-6"
                      />
                      <h6 className="text-primary dark:text-primary">
                        {this.state.bonusTier}
                      </h6>
                    </div>
                  </div>
                  <hr className="calculator-hr"></hr>
                  <div className="flex justify-between my-4">
                    <div className="flex gap-2">
                      <h5 className="text-primary font-bold dark:text-primary ">
                        {this.props.vaultApy[this.state.tempkey]
                          ? this.props.vaultApy[this.state.tempkey]
                          : "0"}
                        %
                      </h5>
                      <p className="text-primary dark:text-primary font-normal flex">
                        {" "}
                        APY on {vaultData[this.state.tempkey].subname}{" "}
                      </p>
                    </div>

                    <h6 className="text-primary dark:text-primary">
                      {this.props.vaultApy[this.state.tempkey] &&
                      !this.state.isChecked
                        ? displayCommaBalance(
                            (this.sanitiseComma(
                              this.props.vaultApy[this.state.tempkey]
                            ) *
                              this.state.tokenAmount) /
                              100,
                            2
                          )
                        : "0"}{" "}
                      {vaultData[this.state.tempkey].subname}
                    </h6>
                  </div>
                  <hr className="calculator-hr"></hr>
                  <div className="flex justify-between my-2">
                    <h5 className="text-primary dark:text-primary">
                      <h5 className="gap-2 flex font-normal">
                        <span className="font-bold">
                          {this.state.bonusAPY}%
                        </span>
                        Bonus APY
                      </h5>
                      <span className="text-xs text-secondary flex flex-column">
                        {`1 NORD = ${this.props.nordPrice}$`}
                      </span>{" "}
                    </h5>
                    <h6 className="text-primary dark:text-primary">
                      {" "}
                      {this.state.tokenAmount &&
                      this.props.nordPrice &&
                      !this.state.isChecked
                        ? displayCommaBalance(
                            (this.state.tokenAmount * this.state.bonusAPY) /
                              (this.props.nordPrice * 100),
                            2
                          )
                        : "0"}{" "}
                      Nord{" "}
                    </h6>
                  </div>
                  <hr className="calculator-hr"></hr>
                  <div className="flex justify-between my-4">
                    <div className="flex gap-2">
                      <p className="font-bold text-primary dark:text-primary">
                        {this.state.bonusAPY}%
                      </p>
                      <h5 className="text-primary dark:text-primary ">
                        APY on NORD
                      </h5>
                    </div>

                    <h6 className="text-primary dark:text-primary">
                      {this.state.nordAmount &&
                      this.props.nordPrice &&
                      !this.state.isChecked
                        ? displayCommaBalance(
                            (this.state.nordAmount * this.state.bonusAPY) / 100,
                            2
                          )
                        : "0"}{" "}
                      Nord{" "}
                    </h6>
                  </div>
                  <hr className="calculator-hr"></hr>
                  <p
                    className={`text-sm italic pb-1 text-center text-primary dark:text-primary ${
                      this.isCalculatorTier("Titanium") ? "" : "hide"
                    }`}
                  >
                    {this.isCalculatorTier("Titanium")
                      ? `50% discount on protocol fees`
                      : "valid"}
                  </p>
                  <div className="text-center py-5 mt-12 apy">
                    <h4 className="text-primary dark:text-primary">
                      {" "}
                      Your Earnings After 1 Year{" "}
                    </h4>
                    <h3 className="text-xl font-bold text-primary dark:text-primary">
                      {" "}
                      ${displayCommaBalance(
                        this.calculateTotalRewards(),
                        2
                      )}{" "}
                    </h3>
                  </div>
                </div>
              </div>
            </>
          )}
          <ConfirmModal
            amount={this.state.tokenAmount}
            isConfirmPopupOpen={this.state.isConfirmPopupOpen}
            confirmPopupType={this.state.isChecked ? "Withdrawal" : "Deposit"}
            selectedToken={
              this.state.tempkey !== null
                ? this.state.isChecked
                  ? vaultData[this.state.tempkey].ntokenname
                  : vaultData[this.state.tempkey].subname
                : ""
            }
            nordData={[
              this.state.isChecked
                ? this.is100PercentageWithdrawal()
                  ? this.sanitiseComma(this.getStakedNordBalanceToDisplay())
                  : "0"
                : this.state.nordAmount,
              this.state.nordInfiniteApproval,
            ]}
            withdrawFee={this.getWithdrawFee()}
            secondLine={
              this.state.tempkey !== null
                ? ["Vault", vaultData[this.state.tempkey].subname]
                : []
            }
            displayInfiniteSwitch={this.state.displayInfiniteSwitch}
            infiniteApproval={this.state.infiniteApproval}
            handleChange={this._handleInfiniteApprovalChange}
            handlePopupClose={this.handlePopupClose}
          />
        </div>
      </>
    );
  }
}

SavingsWithStaking.propTypes = {
  web3: PropTypes.object.isRequired,
  web3Biconomy: PropTypes.object.isRequired,
  biconomy: PropTypes.object.isRequired,
  accounts: PropTypes.array.isRequired,
  depositBalance: PropTypes.array.isRequired,
  withdrawBalance: PropTypes.array.isRequired,
  nordBalance: PropTypes.string.isRequired,
  vaultApy: PropTypes.array.isRequired,
  currentNetworkID: PropTypes.number.isRequired,
  showErrorMessage: PropTypes.instanceOf(Promise),
  showSuccessMessage: PropTypes.instanceOf(Promise),
  displayCardClickError: PropTypes.instanceOf(Promise),
  setOverlay: PropTypes.instanceOf(Promise),
  updateBalance: PropTypes.instanceOf(Promise),
  nordPrice: PropTypes.number.isRequired,
  unclaimedBal: PropTypes.array.isRequired,
  calculateReceivingAmount: PropTypes.func,
  earnedNordInVault: PropTypes.array.isRequired,
  stakedNordInVault: PropTypes.array.isRequired,
};

export default SavingsWithStaking;
