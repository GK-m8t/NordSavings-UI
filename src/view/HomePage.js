import React, { Component } from "react";
import Footer from "../components/footer";
import Logo from "../assets/images/logo.png";
import Web3 from "web3";

import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";

class HomePage extends Component {
  web3Modal;
  constructor(props) {
    super(props);
    this.state = {};
    this.web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: this.getProviderOptions(),
    });
  }

  async onConnect() {
    const provider = await this.web3Modal.connect();
    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();

    const address = accounts[0];
    console.log(`connected account:  ${address}`);
    console.log(provider);
    if (accounts.length) {
      window.location.href = "/dashboard";
    }
  }

  getProviderOptions = () => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: process.env.REACT_APP_INFURA_ID,
        },
      },
    };
    return providerOptions;
  };

  render() {
    return (
      <>
        <div className="bg-color h-screen ">
          <div className="flex justify-center pt-12">
            <img src={Logo} alt="" className="text-center h-24" />
          </div>
          <div className="bg-image">
            <div className="grid justify-center pt-40">
              <h2 className="text-4xl">
                Welcome to{" "}
                <span className="font-bold secondary-color">Nord Finance</span>
              </h2>
              <p className="text-center pt-6">Connect your wallet to login</p>
            </div>
            <div className="flex justify-center pt-8">
              <button
                className="py-3 px-16 cursor-pointer focus:outline-none btn-connect active:outline-none"
                onClick={() => {
                  this.onConnect();
                }}
              >
                Connect
              </button>
            </div>
            <div className="pt-24 inset-x-0 bottom-0">
              <Footer />
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default HomePage;
