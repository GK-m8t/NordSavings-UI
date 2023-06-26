import Coin from "../assets/images/usd-coin.svg";
import Tether from "../assets/images/tether.svg";
import Dai from "../assets/images/dai.svg";
import Nord from "../assets/images/nordcon.svg";
import AAVE from "../assets/images/aave.png";
import BTC from "../assets/images/btc.svg";
import LINK from "../assets/images/chainlink.svg";
import UNI from "../assets/images/uniswap.svg";
import { UniSwapSVG, NordBigIconStr } from "../components/icon/icon";
import ETH from "../assets/images/eth.svg";
// import Bsc from "../assets/images/bia.svg";
import POLYGON from "../assets/images/polygon.svg";
const vaultABI = require("../abi/vault.json");
const stakingVaultABI = require("../abi/stakingVault.json");
const savingsVaultwithStakingABI = require("../abi/savingsVaultwithStaking.json");
const chainlinkABI = require("../abi/chainlink.json");
const ercABI = require("../abi/ERC20.json");
const maticErcABI = require("../abi/Matic-ERC20.json");
const maticUSDCErcABI = require("../abi/Matic-USDC-ERC20.json");
// const uniswapStakingABI = require("../abi/uniswapStaking.json");
const NordStakingWithUnboundingDurationABI = require("../abi/nordStaking.json");
const nordStakingwithReinvest = require("../abi/nordStakingwithReinvest.json");
const ETHClaimABI = require("../abi/ETHClaimRewardProxy.json");
const updatedClaimABI = require("../abi/ClaimRewardProxy.json");
const uniswapPairABI = require("../abi/uniswapPair.json");
const FundDivisionStrategyABI = require("../abi/FundDivisionStrategy.json");
const ControllerABI = require("../abi/Controller.json");
const FeeManagerABI = require("../abi/FeeManager.json");

const BalanceUpdateInterval = 120;
const networkData = {
  networkName: {
    1: "Ethereum Mainnet",
    3: "Ethereum Ropsten Testnet",
    4: "Ethereum Rinkleby Testnet",
    5: "Ethereum Goerli Testnet",
    42: "Ethereum Kovan Testnet",
    56: "Binance Smart Chain",
    97: "Binance Smart Chain Testnet",
    137: "Polygon Mainnet",
    80001: "Polygon Mumbai Testnet",
  },
  allowedNetworkID: [1, 137],
  networkIcon: { 1: ETH, 137: POLYGON },
  blockExplorer: {
    1: "https://etherscan.io/",
    42: "https://kovan.etherscan.io/",
    137: "https://polygonscan.com/",
    80001: "https://explorer-mumbai.maticvigil.com/",
  },
  rpcURL: {
    1: "https://mainnet.infura.io/v3/" + process.env.REACT_APP_INFURA_ID,
    42: "https://kovan.infura.io/v3/" + process.env.REACT_APP_INFURA_ID,
    137: "https://rpc-mainnet.matic.network",
    80001: "https://rpc-mumbai.matic.today",
  },
  showSaving: {
    1: true,
    137: true,
  },
  showStaking: {
    1: true,
    137: true,
  },
  showAdvisory: {
    1: false,
    137: true,
  },
};
const coingeckoPriceEndPoint = {
  savings:
    "https://api.coingecko.com/api/v3/simple/price?ids=nord-finance&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true",
  staking:
    "https://api.coingecko.com/api/v3/simple/price?ids=nord-finance%2Cethereum&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true",
  advisory:
    "https://api.coingecko.com/api/v3/simple/price?ids=wrapped-bitcoin%2Cweth%2Cchainlink%2Cuniswap%2Caave%2Cwmatic%2Cusd-coin&vs_currencies=usd&include_market_cap=false&include_24hr_vol=false&include_24hr_change=false&include_last_updated_at=true",
};

const chainLinkPriceFeeds = {
  1: {
    contractAddress: "0xf33045E835201CF2846aF9bEd9Dd672d3973d4c5",
    contractABI: chainlinkABI,
  },
  137: {
    contractAddress: "0xbb2146a2872c5d95db83c97a052464f2fffd429f",
    contractABI: chainlinkABI,
  },
};
const assetData = {
  wBTC: {
    icon: BTC,
    piechartColor: "#f2a900",
    name: "Wrapped BitCoin",
    subname: "wBTC",
    priceApiName: "wrapped-bitcoin",
    contractAddress: { 137: "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6" },
    exchangeAdapterAddress: {
      137: "0x29943B1550e50cE7AA0e1018237d2426ffa6B450",
    },
    tokenABI: ercABI,
    precision: 8,
  },
  wETH: {
    icon: ETH,
    piechartColor: "#3c3c3d",
    name: "Wrapped Ethereum",
    subname: "wETH",
    priceApiName: "weth",
    contractAddress: { 137: "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619" },
    exchangeAdapterAddress: {
      137: "0x29943B1550e50cE7AA0e1018237d2426ffa6B450",
    },
    tokenABI: ercABI,
    precision: 18,
  },
  Link: {
    icon: LINK,
    piechartColor: "#375BD2",
    name: "ChainLink",
    subname: "LINK",
    priceApiName: "chainlink",
    contractAddress: { 137: "0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39" },
    exchangeAdapterAddress: {
      137: "0x29943B1550e50cE7AA0e1018237d2426ffa6B450",
    },
    tokenABI: ercABI,
    precision: 18,
  },
  Uni: {
    icon: UNI,
    piechartColor: "#FF007A",
    name: "Uniswap",
    subname: "UNI",
    priceApiName: "uniswap",
    contractAddress: { 137: "0xb33eaad8d922b1083446dc23f610c2567fb5180f" },
    exchangeAdapterAddress: {
      137: "0x29943B1550e50cE7AA0e1018237d2426ffa6B450",
    },
    tokenABI: ercABI,
    precision: 18,
  },
  AAVE: {
    icon: AAVE,
    piechartColor: "#B6509E",
    name: "Aave",
    subname: "AAVE",
    priceApiName: "aave",
    contractAddress: { 137: "0xd6df932a45c0f255f85145f286ea0b292b21c90b" },
    exchangeAdapterAddress: {
      137: "0x29943B1550e50cE7AA0e1018237d2426ffa6B450",
    },
    tokenABI: ercABI,
    precision: 18,
  },
  wMatic: {
    icon: POLYGON,
    piechartColor: "#8247e5",
    name: "Wrapped Matic",
    subname: "wMatic",
    priceApiName: "wmatic",
    contractAddress: { 137: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270" },
    exchangeAdapterAddress: {
      137: "0x29943B1550e50cE7AA0e1018237d2426ffa6B450",
    },
    tokenABI: ercABI,
    precision: 18,
  },
};
const apyEndPoints = {
  1: {
    showVaultAPYData: true,
    showNordAPYData: false,
    savings: process.env.REACT_APP_ETH_APY_ENDPOINT + "/savings/apy",
    nord: process.env.REACT_APP_ETH_APY_ENDPOINT + "/nord/apy",
  },
  137: {
    showVaultAPYData: true,
    showNordAPYData: false,
    savings: process.env.REACT_APP_POLYGON_APY_ENDPOINT + "/savings/apy",
    nord: process.env.REACT_APP_POLYGON_APY_ENDPOINT + "/savings/apy",
    advisory:
      process.env.REACT_APP_POLYGON_APY_ENDPOINT + "/advisory/vault/apy",
  },
};

const tierAPYBoostDetails = {
  Bronze: 2,
  Silver: 4,
  Gold: 6,
  Platinum: 10,
  Titanium: 12.5,
};

const vaultData = [
  {
    icon: Coin,
    name: "USD Coin",
    priceApiName: "usd-coin",
    precision: 6,
    web3EquivalentPrecision: "picoether",
    subname: "USDC",
    ntokenname: "nUSDC",
    contractDetails: {
      1: {
        id: 0,
        vaultAddress: "0x53E1c9750014C7Cf8303D69A3CA06A555C739DD0",
        vaultABI: vaultABI,
        tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        tokenABI: ercABI,
      },
      137: {
        id: 0,
        eipVersion: "1",
        tokenName: "USD Coin (PoS)",
        enableBiconomy: true,
        nordAPY: "21.9",
        vaultAddress: "0x8a5Ae804Da4924081663D4C5DaB4DC9BB7092E2E",
        vaultABI: savingsVaultwithStakingABI,
        tokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        tokenABI: maticUSDCErcABI,
        vaultStakingAddress: "0x225114D156062692e1Cb625033Fb5aF639F1253c",
        vaultStakingABI: stakingVaultABI,
      },
    },
  },
  {
    icon: Tether,
    id: 1,
    name: "Tether",
    priceApiName: "tether",
    precision: 6,
    web3EquivalentPrecision: "picoether",
    subname: "USDT",
    ntokenname: "nUSDT",
    contractDetails: {
      1: {
        id: 1,
        vaultAddress: "0xCD4F2844b11A4515398fD2201247Cf2ed411245f",
        vaultABI: vaultABI,
        tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        tokenABI: ercABI,
      },
      137: {
        id: 1,
        eipVersion: "1",
        tokenName: "(PoS) Tether USD",
        enableBiconomy: true,
        nordAPY: "21.9",
        vaultAddress: "0xa4dbb459fb9051b976947d2d8ab74477e1720a73",
        vaultABI: savingsVaultwithStakingABI,
        tokenAddress: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
        tokenABI: maticErcABI,
        vaultStakingAddress: "0x292d74Eb25df063A15A2F2aa1e68392f305C70C5",
        vaultStakingABI: stakingVaultABI,
      },
    },
  },
  {
    icon: Dai,
    name: "DAI Stablecoin",
    priceApiName: "dai",
    precision: 18,
    web3EquivalentPrecision: "ether",
    subname: "DAI",
    ntokenname: "nDAI",
    contractDetails: {
      1: {
        id: 2,
        vaultAddress: "0x6Db6ABb2a55154C385e90d3fD05EE8ca46e3BA35",
        vaultABI: vaultABI,
        tokenAddress: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        tokenABI: ercABI,
      },
      137: {
        id: 2,
        eipVersion: "1",
        tokenName: "(PoS) Dai Stablecoin",
        enableBiconomy: true,
        nordAPY: "21.9",
        vaultAddress: "0xeE2dEf710a8a0021DCbF99C4cD7f69Dc536fc57b",
        vaultABI: savingsVaultwithStakingABI,
        tokenAddress: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
        tokenABI: maticErcABI,
        vaultStakingAddress: "0x86175F18E0B1bf372076bCC9E35FFEF72B1446B1",
        vaultStakingABI: stakingVaultABI,
      },
    },
  },
];

const nordGovernanceTokenData = {
  precision: 18,
  web3EquivalentPrecision: "ether",
  contractDetails: {
    1: {
      nordTokenAddress: "0x6e9730ecffbed43fd876a264c982e254ef05a0de",
      nordTokenABI: ercABI,
      claimABI: ETHClaimABI,
      claimAddress: "0x663A861e10F7F8461363fe65987eda485d5466A6",
    },
    137: {
      eipVersion: "1",
      tokenName: "Nord Token (PoS)",
      nordTokenAddress: "0xf6f85b3f9fd581c2ee717c404f7684486f057f95",
      nordTokenABI: maticErcABI,
      claimABI: updatedClaimABI,
      claimAddress: "0xC8f5B4b7b266a604c3187B53Bf11551fbAD21c78",
    },
  },
};

const stakingData = [
  {
    icon: NordBigIconStr,
    name: "NORD",
    subname: "NORD",
    precision: 18,
    web3EquivalentPrecision: "ether",
    priceApiName: "nord-finance",
    contractDetails: {
      1: {
        id: 0,
        unboundingPeriod: "12 days",
        stakingAddress: "0x2b9a023415f0feeb88597c1a7d09fdefa0ef5614",
        stakingABI: nordStakingwithReinvest,
        tokenAddress:
          nordGovernanceTokenData.contractDetails[1].nordTokenAddress,
        tokenABI: nordGovernanceTokenData.contractDetails[1].nordTokenABI,
      },
      137: {
        id: 0,
        enableBiconomy: true,
        unboundingPeriod: "12 days",
        stakingAddress: "0xf0882a08D855ec8Ad3f25087dE3FB311A5344b20",
        stakingABI: nordStakingwithReinvest,
        tokenAddress:
          nordGovernanceTokenData.contractDetails[137].nordTokenAddress,
        tokenABI: nordGovernanceTokenData.contractDetails[137].nordTokenABI,
        tokenName: nordGovernanceTokenData.contractDetails[137].tokenName,
        eipVersion: nordGovernanceTokenData.contractDetails[137].eipVersion,
      },
    },
  },
  {
    icon: NordBigIconStr,
    name: "NORD (Old)",
    subname: "NORD",
    precision: 18,
    web3EquivalentPrecision: "ether",
    priceApiName: "nord-finance",
    contractDetails: {
      137: {
        id: 1,
        enableBiconomy: false,
        startTime: new Date(1626444000000),
        unboundingPeriod: "0 hours",
        stakingPeriodInDays: 32,
        stakingAddress: "0x9b2311c6D57EA5a65B29223C87C50C59E1D9cF13",
        stakingABI: NordStakingWithUnboundingDurationABI,
        tokenAddress:
          nordGovernanceTokenData.contractDetails[137].nordTokenAddress,
        tokenABI: nordGovernanceTokenData.contractDetails[137].nordTokenABI,
        tokenName: nordGovernanceTokenData.contractDetails[137].tokenName,
        eipVersion: nordGovernanceTokenData.contractDetails[137].eipVersion,
      },
    },
  },
  {
    icon: UniSwapSVG,
    name: "NORD-ETH UNI-V2",
    subname: "Uni-LP",
    precision: 18,
    web3EquivalentPrecision: "ether",
    priceApiName: "ethereum",
    contractDetails: {
      1: {
        id: 0,
        startTime: new Date(1630074576000),
        stakingPeriodInDays: 30,
        stakingAddress: "0x8c043C37a5f16440A1d6919C7F60aBaEd0592b31",
        stakingABI: NordStakingWithUnboundingDurationABI,
        tokenAddress: "0x5239873C892376799B6Cb49a3CFB1146d4A260b8",
        tokenABI: uniswapPairABI,
      },
    },
  },
];

const advisoryData = [
  {
    icon: Nord,
    underlyingTokenPiechartColor: "#2775CA",
    name: "NORD Quant Fund",
    subname: "nQNTS",
    underlyingTokenIcon: Coin,
    underlyingTokenName: "USDC",
    precision: 6,
    web3EquivalentPrecision: "picoether",
    priceApiName: "usd-coin",
    fundManagedBy: "Solidum Capital",
    contractDetails: {
      137: {
        id: 0,
        eipVersion: "1",
        underlyingTokenName: "USD Coin (PoS)",
        enableBiconomy: true,
        enableMaxCap: true,
        activeAssets: [
          assetData.wBTC,
          assetData.wETH,
          assetData.Link,
          assetData.Uni,
          assetData.AAVE,
          assetData.wMatic,
        ],
        underlyingTokenAddress: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
        underlyingTokenABI: maticUSDCErcABI,
        fundDivisionAddress: "0xFbD47cD659FED4952bAeb70c9ce56d2c3c0A4Da3",
        fundDivisionABI: FundDivisionStrategyABI,
        controllerAddress: "0x6df16257f1E79a7dbe7F5B2bE6B1AdE51964fC38",
        controllerABI: ControllerABI,
        feeManagerAddress: "0x39CC8eaB745035cf4467AC27dd5769C73C92D14D",
        feeManagerABI: FeeManagerABI,
        vaultAddress: "0xa10105C9BFaB2942b542aacBc3835fe4615A8191",
        vaultABI: vaultABI,
        pricesEndpoint:
          process.env.REACT_APP_POLYGON_APY_ENDPOINT + "/advisory/vault/",
        txHistoryEndpoint: "https://api.nordfinance.io/tx/polygon/transaction",
      },
    },
  },
];
export {
  networkData,
  assetData,
  coingeckoPriceEndPoint,
  apyEndPoints,
  tierAPYBoostDetails,
  vaultData,
  chainLinkPriceFeeds,
  stakingData,
  advisoryData,
  nordGovernanceTokenData,
  BalanceUpdateInterval,
};
