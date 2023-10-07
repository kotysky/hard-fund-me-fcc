const { deployments, ethers } = require("hardhat")

async function main() {
    /*const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)*/
    const accounts = await ethers.getSigners()
    deployer = accounts[0]
    const fundMeDeploy = await deployments.get("FundMe")
    fundMe = await ethers.getContractAt(
        fundMeDeploy.abi,
        fundMeDeploy.address,
        deployer
    )
    console.log("Funding contract...")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log("Got it back!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
