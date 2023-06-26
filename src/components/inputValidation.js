const numbro = require("numbro");

const inputCheck = (event, precision) => {
  const clippedFormat = new RegExp(
    /* eslint-disable-next-line */
    "^\\d+(\\.\\d{0," + precision.toString() + "})?$"
  );
  if (clippedFormat.test(event.target.value) || !event.target.value) {
    return event.target.value;
  } else {
    return "invalid";
  }
};

const balanceCheck = (
  amount,
  balance,
  tokenName,
  web3EquivalentPrecision,
  web3
) => {
  if (
    Number(amount) &&
    web3.utils
      .toBN(web3.utils.toWei(amount, web3EquivalentPrecision))
      .gt(web3.utils.toBN(balance))
  ) {
    return "Insufficient " + tokenName + " Balance!!!";
  } else {
    return "";
  }
};

const amountFraction = (
  amount,
  numerator,
  denominator,
  web3EquivalentPrecision,
  web3
) => {
  const amtPercent = web3.utils
    .toBN(amount)
    .mul(web3.utils.toBN(numerator))
    .div(web3.utils.toBN(denominator));
  return web3.utils.fromWei(amtPercent, web3EquivalentPrecision);
};

/**
 * bal : wei Amount
 **/
const displayBalance = (
  bal,
  web3EquivalentPrecision,
  web3,
  precision,
  pricePrecision
) => {
  if (!precision) {
    precision = 2;
  }
  if (!pricePrecision) {
    pricePrecision = 1;
  }
  const displayBal =
    web3.utils.fromWei(bal, web3EquivalentPrecision) / pricePrecision;
  let display = "";
  if (
    bal.lt(
      web3.utils.toBN(
        web3.utils.toWei(web3.utils.toBN(100000 * pricePrecision)),
        web3EquivalentPrecision
      )
    )
  ) {
    display = displayCommaBalance(displayBal, precision);
  } else {
    display = numbro(displayBal)
      .format({
        thousandSeparated: true,
        trimMantissa: true,
        mantissa: precision,
        average: true,
        spaceSeparated: false,
      })
      .toUpperCase();
  }
  return display;
};

const displayCommaBalance = (bal, precision) => {
  return numbro(bal).format({
    thousandSeparated: true,
    trimMantissa: true,
    mantissa: precision,
    spaceSeparated: false,
  });
};

const displayAverageBalance = (bal, precision) => {
  return numbro(bal)
    .format({
      thousandSeparated: true,
      trimMantissa: true,
      mantissa: precision,
      average: true,
      spaceSeparated: false,
    })
    .toUpperCase();
};

const getWeb3Precision = (precision) => {
  let web3Precision = "ether";
  switch (precision) {
    case 6:
      web3Precision = "picoether";
      break;
    case 8:
      web3Precision = "picoether";
      break;
  }
  return web3Precision;
};

const bnDivision = (numerator, denominator, web3, precision) => {
  let displayAmt = "";
  if (numerator.mod(denominator).toString() === "0") {
    displayAmt = numerator.div(denominator).toString();
  } else {
    displayAmt = numerator.div(denominator).toString() + ".";
    let remainder = numerator.mod(denominator);
    let index = 0;
    while (remainder.toString === "0" || index < precision) {
      remainder = remainder.mul(web3.utils.toBN("10"));
      displayAmt += remainder.div(denominator);
      index += 1;
      remainder = remainder.mod(denominator);
    }
  }
  return displayAmt;
};

export {
  inputCheck,
  balanceCheck,
  amountFraction,
  displayBalance,
  displayCommaBalance,
  displayAverageBalance,
  getWeb3Precision,
  bnDivision,
};
