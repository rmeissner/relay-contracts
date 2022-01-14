import { expect } from "chai";
import { deployments, ethers, waffle } from "hardhat";
import "@nomiclabs/hardhat-ethers";
import { getEnableModuleLib, getExecutor, getMock } from "../utils/setup";

describe("EnableModulesLib", async () => {

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

    describe("enableModules", async () => {

        it('should revert if used with call', async () => {
            const { mock, executor, lib } = await setupTests()
            const data = lib.interface.encodeFunctionData("enableModules", [[mock.address]])
            await expect(
                executor.exec(lib.address, 0, data, 0)
            ).to.be.reverted
            await expect(
                await executor.moduleCount()
            ).to.be.equal(0)
        })

        it('should enable module', async () => {
            const { mock, executor, lib } = await setupTests()
            const data = lib.interface.encodeFunctionData("enableModules", [[mock.address]])
            await executor.exec(lib.address, 0, data, 1)
            await expect(
                await executor.moduleCount()
            ).to.be.equal(1)
            await expect(
                await executor.modules(mock.address)
            ).to.be.equal(true)
        })

        it('should enable multiple module', async () => {
            const { mock, executor, lib } = await setupTests()
            const data = lib.interface.encodeFunctionData("enableModules", [[mock.address, user2.address]])
            await executor.exec(lib.address, 0, data, 1)
            await expect(
                await executor.moduleCount()
            ).to.be.equal(2)
            await expect(
                await executor.modules(mock.address)
            ).to.be.equal(true)
            await expect(
                await executor.modules(user2.address)
            ).to.be.equal(true)
        })

        it('should work with empty array', async () => {
            const { mock, executor, lib } = await setupTests()
            const data = lib.interface.encodeFunctionData("enableModules", [[]])
            await executor.exec(lib.address, 0, data, 1)
            await expect(
                await executor.moduleCount()
            ).to.be.equal(0)
        })
    })
})