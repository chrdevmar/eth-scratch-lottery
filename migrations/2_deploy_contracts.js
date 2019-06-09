const ScratchLottery = artifacts.require("ScratchLottery");

module.exports = function(deployer) {
  deployer.deploy(ScratchLottery);
};