import { expect } from "chai";
import hre, { deployments, ethers, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { getExecutor, getFixedRewardModule, getMock } from "../utils/setup";
import { parseEther } from "@ethersproject/units";
import { logGas } from "../utils/gas";

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

    describe("log gas difference", async () => {

        it('gas consumptions without relay', async () => {
            const { mock, executor } = await setupTests()
            await logGas(
                "execute transaction directly",
                executor.execTransaction(
                    mock.address, 0, "0xbaddad42", 0, 0, 0, 0, ethers.constants.AddressZero, ethers.constants.AddressZero, "0x"
                )
            )
        })

        it('gas consumptions with relay', async () => {
            const { mock, executor, module } = await setupTests()
            const execTransactionData = executor.interface.encodeFunctionData("execTransaction", [mock.address, 0, "0xbaddad42", 0, 0, 0, 0, ethers.constants.AddressZero, ethers.constants.AddressZero, "0x"])
            await executor.enableModule(module.address)
            await user1.sendTransaction({ to: executor.address, value: parseEther("0.005") })
            await logGas(
                "execute transaction via relay",
                module.relayTransaction(executor.address, execTransactionData, user1.address)
            )
        })

    })
})