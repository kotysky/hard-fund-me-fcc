//
const { network } = require("hardhat")
const {
    developmentsChains,
    INITIAL_ANSWER,
    DECIMALS,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deploymentd }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    if (developmentsChains.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
        log("Mocks deployed!")
        log("------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
