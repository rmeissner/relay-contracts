import { expect } from "chai";
import hre, { deployments, ethers, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { getExecutor, getFixedRewardModule, getMock } from "../utils/setup";
import { parseEther } from "@ethersproject/units";

describe("RelayModuleFixedReward", async () => {

    const [user1, user2] = waffle.provider.getWallets();

    const setupTests = deployments.createFixture(async ({ deployments }) => {
        await deployments.fixture();
        const module = await getFixedRewardModule()
        const mock = await getMock()
        const executor = await getExecutor()
        return {
            mock,
            executor,
            module
        }
    })

    describe("relayTransaction", async () => {

        it('should require enabled module', async () => {
            const { mock, executor, module } = await setupTests()
            const execTransactionData = executor.interface.encodeFunctionData("execTransaction", [mock.address, 0, "0xbaddad42", 0, 0, 0, 0, ethers.constants.AddressZero, ethers.constants.AddressZero, "0x"])
            await expect(
                module.relayTransaction(executor.address, execTransactionData, user2.address)
            ).to.be.revertedWith("TestExecutor: Not authorized")
        })

        it('should require payment', async () => {
            const { mock, executor, module } = await setupTests()
            const execTransactionData = executor.interface.encodeFunctionData("execTransaction", [mock.address, 0, "0xbaddad42", 0, 0, 0, 0, ethers.constants.AddressZero, ethers.constants.AddressZero, "0x"])
            await executor.setModule(module.address)
            await expect(
                module.relayTransaction(executor.address, execTransactionData, user2.address)
            ).to.be.revertedWith("RewardPaymentFailure()")
        })

        it('should only allow defined method', async () => {
            const { mock, executor, module } = await setupTests()
            const execData = executor.interface.encodeFunctionData("exec", [mock.address, 0, "0xbaddad42"])
            await executor.setModule(module.address)
            await user1.sendTransaction({ to: executor.address, value: parseEther("0.005")})
            await expect(
                await hre.ethers.provider.getBalance(executor.address)
            ).to.be.equals(parseEther("0.005"))
            await expect(
                module.relayTransaction(executor.address, execData, user2.address)
            ).to.be.revertedWith("InvalidRelayData()")
            await expect(
                await hre.ethers.provider.getBalance(executor.address)
            ).to.be.equals(parseEther("0.005"))
        })

        it('should require call to be successful', async () => {
            const { mock, executor, module } = await setupTests()
            const execTransactionData = executor.interface.encodeFunctionData("execTransaction", [mock.address, 0, "0xbaddad42", 0, 0, 0, 0, ethers.constants.AddressZero, ethers.constants.AddressZero, "0x"])
                        await executor.setModule(module.address)
            await user1.sendTransaction({ to: executor.address, value: parseEther("0.005")})
            await expect(
                await hre.ethers.provider.getBalance(executor.address)
            ).to.be.equals(parseEther("0.005"))
            await mock.givenAnyRevert()
            await expect(
                module.relayTransaction(executor.address, execTransactionData, user2.address)
            ).to.be.revertedWith("RelayExecutionFailure()")
            await expect(
                await hre.ethers.provider.getBalance(executor.address)
            ).to.be.equals(parseEther("0.005"))
        })

        it('should not revert if successful', async () => {
            const { mock, executor, module } = await setupTests()
            const execTransactionData = executor.interface.encodeFunctionData("execTransaction", [mock.address, 0, "0xbaddad42", 0, 0, 0, 0, ethers.constants.AddressZero, ethers.constants.AddressZero, "0x"])
                        await executor.setModule(module.address)
            await user1.sendTransaction({ to: executor.address, value: parseEther("0.005")})
            await expect(
                await hre.ethers.provider.getBalance(executor.address)
            ).to.be.equals(parseEther("0.005"))
            await module.relayTransaction(executor.address, execTransactionData, user2.address)

             // Check that fee was deducted
            await expect(
                await hre.ethers.provider.getBalance(executor.address)
            ).to.be.equals(0)

            // Check that target was called exactly 1 time with expected data
            await expect(
                await mock.callStatic.invocationCount()
            ).to.be.equals(1)
            await expect(
                await mock.callStatic.invocationCountForMethod("0xbaddad42")
            ).to.be.equals(1)
        })

    })
})