import hre, { deployments } from "hardhat"
import { Wallet, Contract } from "ethers"
import solc from "solc"

export const getFixedRewardModule = async () => {
    const Deployment = await deployments.get("RelayModuleFixedReward");
    const Contract = await hre.ethers.getContractFactory("RelayModuleFixedReward");
    return Contract.attach(Deployment.address);
}

export const getEnableModuleLib = async () => {
    const Deployment = await deployments.get("EnableModuleLib");
    const Contract = await hre.ethers.getContractFactory("EnableModuleLib");
    return Contract.attach(Deployment.address);
}

export const getMock = async () => {
    const Mock = await hre.ethers.getContractFactory("MockContract");
    return await Mock.deploy();
}

export const getExecutor = async () => {
    const Executor = await hre.ethers.getContractFactory("TestExecutor");
    return await Executor.deploy();
}

export const compile = async (source: string) => {
    const input = JSON.stringify({
        'language': 'Solidity',
        'settings': {
            'outputSelection': {
            '*': {
                '*': [ 'abi', 'evm.bytecode' ]
            }
            }
        },
        'sources': {
            'tmp.sol': {
                'content': source
            }
        }
    });
    const solcData = await solc.compile(input)
    const output = JSON.parse(solcData);
    if (!output['contracts']) {
        console.log(output)
        throw Error("Could not compile contract")
    }
    const fileOutput = output['contracts']['tmp.sol']
    const contractOutput = fileOutput[Object.keys(fileOutput)[0]]
    const abi = contractOutput['abi']
    const data = '0x' + contractOutput['evm']['bytecode']['object']
    return {
        "data": data,
        "interface": abi
    }
}

export const deployContract = async (deployer: Wallet, source: string): Promise<Contract> => {
    const output = await compile(source)
    const transaction = await deployer.sendTransaction({ data: output.data, gasLimit: 6000000 })
    const receipt = await transaction.wait()
    return new Contract(receipt.contractAddress, output.interface, deployer)
}