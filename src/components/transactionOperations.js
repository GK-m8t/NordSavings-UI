const claimCheck = async (
  amt,
  approve,
  accountAddress,
  contractAddress,
  web3EquivalentPrecision,
  web3
) => {
  const approvedBal = web3.utils.toBN(
    await approve.methods
      .allowance(accountAddress, contractAddress)
      .call({ from: accountAddress })
  );
  return web3.utils
    .toBN(web3.utils.toWei(amt, web3EquivalentPrecision))
    .gt(approvedBal);
};

const contractOperation = async (
  setOverlay,
  operation,
  functionName,
  accountAddress,
  parameters
) => {
  let operationFlag = false;
  await operation.methods[functionName](...parameters)
    .send({ from: accountAddress }, (error, tHash) => {
      if (error) {
        console.log(`Error while sending ${functionName} tx: ${error}`);
        operationFlag = false;
        return;
      }
      setOverlay(true, "", tHash);
    })
    .then(function (receipt) {
      operationFlag = receipt.status;
      console.log(receipt);
    })
    .catch(function (err) {
      console.log(err);
      operationFlag = false;
    });
  setOverlay(false, "", "");
  return operationFlag;
};

const contractOperationWithBiconomy = async (
  setOverlay,
  operation,
  functionName,
  accountAddress,
  biconomy,
  parameters
) => {
  let operationFlag = false;
  await operation.methods[functionName](...parameters)
    .send(
      { from: accountAddress, signatureType: biconomy.EIP712_SIGN },
      (error, tHash) => {
        if (error) {
          console.log(`Error while sending ${functionName} tx: ${error}`);
          operationFlag = false;
          return;
        }
        setOverlay(true, "", tHash);
      }
    )
    .then(function (receipt) {
      operationFlag = receipt.status;
      console.log(receipt);
    })
    .catch(function (err) {
      console.log(err);
      operationFlag = false;
    });
  setOverlay(false, "", "");
  return operationFlag;
};

const claimOperation = async (
  setOverlay,
  claim,
  functionName,
  accountAddress
) => {
  let claimFlag = false;
  await claim.methods[functionName]()
    .send({ from: accountAddress }, (error, tHash) => {
      if (error) {
        console.log(`Error while sending claim tx: ${error}`);
        claimFlag = false;
        return;
      }
      setOverlay(true, "", tHash);
    })
    .then(function (receipt) {
      claimFlag = receipt.status;
      console.log(receipt);
    })
    .catch(function (err) {
      console.log(err);
      claimFlag = false;
    });
  setOverlay(false, "", "");
  return claimFlag;
};

const claimOperationWithBiconomy = async (
  setOverlay,
  claim,
  functionName,
  accountAddress,
  biconomy
) => {
  let claimFlag = false;
  await claim.methods[functionName]()
    .send(
      { from: accountAddress, signatureType: biconomy.EIP712_SIGN },
      (error, tHash) => {
        if (error) {
          console.log(`Error while sending ${functionName} tx: ${error}`);
          claimFlag = false;
          return;
        }
        setOverlay(true, "", tHash);
      }
    )
    .then(function (receipt) {
      claimFlag = receipt.status;
      console.log(receipt);
    })
    .catch(function (err) {
      console.log(err);
      claimFlag = false;
    });
  setOverlay(false, "", "");
  return claimFlag;
};

export {
  claimCheck,
  contractOperation,
  contractOperationWithBiconomy,
  claimOperation,
  claimOperationWithBiconomy,
};
