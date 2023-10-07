const networkConfig = {
    11155111: {
        name: "sepolia",
        ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    },
    1442: {
        name: "polygon",
        ethUsdPriceFeed: "0x1a0Df40e0F195593d244Eb99E2Ad9Ba7f34C1076",
    },
    80001: {
        name: "mumbai",
        ethUsdPriceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A",
    },
}
const developmentsChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_ANSWER = 200000000000

module.exports = {
    networkConfig,
    developmentsChains,
    DECIMALS,
    INITIAL_ANSWER,
}
