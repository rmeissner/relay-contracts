import { expect } from "chai";
import { deployments, ethers, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { getEnableModuleLib, getExecutor, getMock } from "../utils/setup";

describe("EnableModuleLib", async () => {

    const [user1, user2] = waffle.provider.getWallets();

    const setupTests = deployments.createFixture(async ({ deployments }) => {
        await deployments.fixture();
        const lib = await getEnableModuleLib()
        const mock = await getMock()
        const executor = await getExecutor()
        return {
            mock,
            executor,
            lib
        }
    })

    describe("enableModule", async () => {

        it('should revert if used with call', async () => {
            const { mock, executor, lib } = await setupTests()
            const data = lib.interface.encodeFunctionData("enableModule", [mock.address])
            await expect(
                executor.exec(lib.address, 0, data, 0)
            ).to.be.reverted
            await expect(
                await executor.module()
            ).to.be.equal(ethers.constants.AddressZero)
        })

        it('should set module', async () => {
            const { mock, executor, lib } = await setupTests()
            const data = lib.interface.encodeFunctionData("enableModule", [mock.address])
            await executor.exec(lib.address, 0, data, 1)
            await expect(
                await executor.module()
            ).to.be.equal(mock.address)
        })
    })
})