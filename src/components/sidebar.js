import React, { Component } from "react";
// import Iconbutton from "../assets/images/navicon.svg";
// import BackIcon from "../assets/images/iconback.svg";
import {
  Wallet,
  Lock,
  Unclaimed,
  NordSmallIcon,
} from "../components/icon/icon";
// import Lock from "../assets/images/lock.svg";
// import Unclaimed from "../assets/images/unclaim.svg";
import Numbro from "numbro";
import PropTypes from "prop-types";
import LoadingOverlay from "react-loading-overlay";

class sidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true,
    };
  }

  handleToggle = () => {
    this.setState((state) => {
      return {
        isOpen: !state.isOpen,
      };
    });
  };

  render() {
    return (
      <>
        {/* <div
        className={
          (this.props.showSidebar ? "show" : "hide") + " flex h-full relative"
        }
        > */}
        {/* {this.state.isOpen || !this.props.showSidebar ? ( */}
        {/* <div className=" "> */}
        {/* <div className="grid justify-center sidebar-back">
                <img
                  src={Iconbutton}
                  alt=""
                  className="h-12 cursor-pointer"
                  onClick={this.handleToggle}
                />
              </div> */}
        {/* <LoadingOverlay active={this.props.showOverlay} className="">
              <div className="grid grid-cols-2 px-28 container mx-auto">
                <div className="card flex justify-between ">
                  <div>
                    <div className="flex">
                      <p className="font-bold" title={this.props.nBal[0]}>
                        {this.props.nBal[0]
                          ? this.props.nBal[0] < 100000
                            ? Numbro(this.props.nBal[0]).format({
                                thousandSeparated: true,
                                trimMantissa: true,
                                mantissa: 2,
                                spaceSeparated: false,
                              })
                            : Numbro(this.props.nBal[0])
                                .format({
                                  thousandSeparated: true,
                                  trimMantissa: true,
                                  mantissa: 2,
                                  average: true,
                                  spaceSeparated: false,
                                })
                                .toUpperCase()
                          : "0"}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <p className="flex gap-4">
                        <img src={Wallet} alt="" className="" /> Wallet Balance
                      </p>
                    </div>
                  </div>

                  <div
                    className={
                      (this.props.showUnclaimedBalance ? "" : "hide-data ") + ""
                    }
                  >
                    <div>
                      <p className="font-bold" title={this.props.nBal[1]}>
                        {this.props.nBal[1]
                          ? this.props.nBal[1] < 100000
                            ? Numbro(this.props.nBal[1]).format({
                                thousandSeparated: true,
                                trimMantissa: true,
                                mantissa: 2,
                                spaceSeparated: false,
                              })
                            : Numbro(this.props.nBal[1])
                                .format({
                                  thousandSeparated: true,
                                  trimMantissa: true,
                                  mantissa: 2,
                                  average: true,
                                  spaceSeparated: false,
                                })
                                .toUpperCase()
                          : "0"}
                      </p>
                      <p className="">Unclaimed Balance</p>
                    </div>

                    <div
                      className={
                        (this.props.showUnclaimedBalance ? "" : "hide-data ") +
                        "flex justify-between"
                      }
                    >
                      <button
                        className={` btn-green py-1 px-2 ${
                          !this.props.showUnclaimedBalance ? "hide-data" : ""
                        }`}
                        onClick={() => {
                          this.props.claim();
                        }}
                        disabled={this.props.loading}
                      >
                        Claim NORD
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className={
                    (this.props.showSavings ? "" : "hide-data ") +
                    "card leading-loose"
                  }
                >
                  <p className="flex gap-4">
                    <img src={Lock} alt="" />
                    Total Value Locked
                  </p>
                  <p className="font-bold">
                    {this.props.tSupply
                      ? this.props.tSupply < 100000
                        ? Numbro(this.props.tSupply).format({
                            thousandSeparated: true,
                            trimMantissa: true,
                            mantissa: 2,
                            spaceSeparated: false,
                          }) + " USD"
                        : Numbro(this.props.tSupply)
                            .format({
                              thousandSeparated: true,
                              trimMantissa: true,
                              mantissa: 2,
                              average: true,
                              spaceSeparated: false,
                            })
                            .toUpperCase() + " USD"
                      : "0 USD"}
                  </p>
                  <hr className="my-4"></hr>
                  {this.props.tokens.map((data, index) => (
                    <div className="flex justify-between" key={index}>
                      <p className="text-sm text-color">{data}</p>
                      <p className="font-bold">
                        {this.props.vSupply[index]
                          ? this.props.vSupply[index] < 100000
                            ? Numbro(this.props.vSupply[index]).format({
                                thousandSeparated: true,
                                trimMantissa: true,
                                mantissa: 2,
                                spaceSeparated: false,
                              })
                            : Numbro(this.props.vSupply[index])
                                .format({
                                  thousandSeparated: true,
                                  trimMantissa: true,
                                  mantissa: 2,
                                  average: true,
                                  spaceSeparated: false,
                                })
                                .toUpperCase()
                          : "0"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </LoadingOverlay>
          </div> */}
        {/* ) : ( */}
        {/* <div className="w-20 h-screen-custom bg-sidebar overflow-y-hidden">
            <div className="grid justify-center sidebar-back">
              <img
                src={BackIcon}
                alt=""
                className="h-12 cursor-pointer"
                onClick={this.handleToggle}
              />
            </div>
          </div> */}
        {/* )} */}
        {/* </div> */}
        <LoadingOverlay active={this.props.showOverlay} className="">
          <div
            className={
              (this.props.showSidebar ? "" : "hide-data ") +
              "lg:grid lg:grid-cols-2 md:block lg:gap-6 md:gap-4 lg:container mx-auto lg:pt-6 pb-4 lg:px-32 md:px-12 "
            }
          >
            <div
              className={
                (this.props.showSavings ? "" : "hide-data ") +
                "card  py-4 px-6 flex md:mt-4 items-center"
              }
            >
              <div className="vr-border">
                <p
                  className="text-xl pb-2 font-bold text-primary dark:text-primary sidebar-title-balance"
                  title={this.props.nBal[0]}
                >
                  <NordSmallIcon />
                  {this.props.nBal[0]
                    ? this.props.nBal[0] < 100000
                      ? Numbro(this.props.nBal[0]).format({
                          thousandSeparated: true,
                          trimMantissa: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        })
                      : Numbro(this.props.nBal[0])
                          .format({
                            thousandSeparated: true,
                            trimMantissa: true,
                            mantissa: 2,
                            average: true,
                            spaceSeparated: false,
                          })
                          .toUpperCase()
                    : "0"}
                </p>
                <div className="flex gap-2">
                  {/* <img src={Wallet} alt="Unclaim" className="h-6" /> */}
                  <Wallet />
                  <p className="dark:text-primary">Wallet </p>
                </div>
              </div>
              <div
                className={
                  this.props.showUnclaimedBalance ? "ml-4" : "hide-data "
                }
              >
                <p
                  className="font-bold text-xl pb-2 text-primary dark:text-primary sidebar-title-balance"
                  title={this.props.nBal[1]}
                >
                  <NordSmallIcon />
                  {this.props.nBal[1]
                    ? this.props.nBal[1] < 100000
                      ? Numbro(this.props.nBal[1]).format({
                          thousandSeparated: true,
                          trimMantissa: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        })
                      : Numbro(this.props.nBal[1])
                          .format({
                            thousandSeparated: true,
                            trimMantissa: true,
                            mantissa: 2,
                            average: true,
                            spaceSeparated: false,
                          })
                          .toUpperCase()
                    : "0"}
                </p>
                <div className="flex gap-3 items-center">
                  {/* <img src={Unclaim} alt="Unclaim" className="h-6" /> */}
                  <p className="flex gap-2">
                    <Unclaimed />
                    {/* <img src={Unclaimed} alt="Unclaim" className="h-6" />{" "} */}
                    Unclaimed
                  </p>
                  <button
                    className="btn-green py-1 px-3 font-semibold"
                    onClick={() => {
                      this.props.claim();
                    }}
                    disabled={this.props.loading}
                  >
                    Claim Now
                  </button>
                </div>
              </div>
            </div>

            <div
              className={
                (this.props.showSavings ? "" : "hide-data ") +
                "card py-10 px-6 flex md:mt-4 gap-4"
              }
            >
              <div className="pr-6 vr-border">
                <p className="pb-3 font-bold">
                  {this.props.tSupply
                    ? this.props.tSupply < 100000
                      ? Numbro(this.props.tSupply).format({
                          thousandSeparated: true,
                          trimMantissa: true,
                          mantissa: 2,
                          spaceSeparated: false,
                        }) + " USD"
                      : Numbro(this.props.tSupply)
                          .format({
                            thousandSeparated: true,
                            trimMantissa: true,
                            mantissa: 2,
                            average: true,
                            spaceSeparated: false,
                          })
                          .toUpperCase() + " USD"
                    : "0 USD"}
                </p>
                <div className="">
                  <p className="flex gap-1">
                    <Lock />
                    {/* <img src={Lock} alt="" /> */}
                    Total Value Locked
                  </p>
                </div>
              </div>
              {this.props.tokens.map((data, index) => (
                <div className="" key={index}>
                  <p className="font-bold pb-3">
                    {this.props.vSupply[index]
                      ? this.props.vSupply[index] < 100000
                        ? Numbro(this.props.vSupply[index]).format({
                            thousandSeparated: true,
                            trimMantissa: true,
                            mantissa: 2,
                            spaceSeparated: false,
                          })
                        : Numbro(this.props.vSupply[index])
                            .format({
                              thousandSeparated: true,
                              trimMantissa: true,
                              mantissa: 2,
                              average: true,
                              spaceSeparated: false,
                            })
                            .toUpperCase()
                      : "0"}
                  </p>
                  <div className="flex items-center gap-1">
                    {/* <p>w</p> */}
                    <img src={data.icon} alt="" className="h-4" />
                    <p className="">{data.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LoadingOverlay>
      </>
    );
  }
}

sidebar.propTypes = {
  nBal: PropTypes.array.isRequired,
  tSupply: PropTypes.number.isRequired,
  tokens: PropTypes.array.isRequired,
  vSupply: PropTypes.array.isRequired,
  claim: PropTypes.instanceOf(Promise),
  loading: PropTypes.bool.isRequired,
  showSidebar: PropTypes.bool.isRequired,
  showOverlay: PropTypes.bool.isRequired,
  showUnclaimedBalance: PropTypes.bool.isRequired,
  showSavings: PropTypes.bool.isRequired,
};

export default sidebar;
