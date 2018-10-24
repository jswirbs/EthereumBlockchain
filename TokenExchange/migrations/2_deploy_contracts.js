var ERCToken = artifacts.require("./ERCToken.sol");

module.exports = function(deployer) {
  deployer.deploy(ERCToken);
};
