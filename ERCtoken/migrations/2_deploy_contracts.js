var ERC20 = artifacts.require("./ERcToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ERC20);
};
