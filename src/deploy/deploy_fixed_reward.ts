import { ethers } from "ethers";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;

  // TODO: allow to configure reward via env
  // The default reward is configured for the Gnosis Chain where xDai is the native currentcy
  const reward = ethers.utils.parseEther("0.005")
  
  // execTransaction(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)
  // https://www.4byte.directory/signatures/?bytes4_signature=0x6a761202
  const relayMethod = "0x6a761202"

  await deploy("RelayModuleFixedReward", {
    from: deployer,
    args: [reward, relayMethod],
    log: true,
    deterministicDeployment: true,
  });
};

deploy.tags = ['gc']
export default deploy;
