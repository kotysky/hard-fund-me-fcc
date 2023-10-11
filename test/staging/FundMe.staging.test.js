const { ethers, network, deployments } = require("hardhat")
const { developmentsChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentsChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          const sendValue = ethers.parseEther("0.1") // 1eth
          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              deployer = accounts[0]

              const fundMeDeploy = await deployments.get("FundMe")
              fundMe = await ethers.getContractAt(
                  fundMeDeploy.abi,
                  fundMeDeploy.address,
                  deployer
              )
          })
          it("Allows people to fund and withdraw", async () => {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await ethers.provider.getBalance(
                  fundMe.getAddress()
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
