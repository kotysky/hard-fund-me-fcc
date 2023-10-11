const { assert, expect } = require("chai")
const { deployments } = require("hardhat")
const { ethers, network } = require("hardhat")
const { developmentsChains } = require("../../helper-hardhat-config")

!developmentsChains.includes(network.name)
    ? describe.skip
    : describe("FunMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.parseEther("0.001") // 1eth
          beforeEach(async function () {
              // deploy
              const accounts = await ethers.getSigners()
              deployer = accounts[0]

              await deployments.fixture(["all"])

              const fundMeDeploy = await deployments.get("FundMe")
              fundMe = await ethers.getContractAt(
                  fundMeDeploy.abi,
                  fundMeDeploy.address,
                  deployer
              )
              const mockV3AggregatorDeploy = await deployments.get(
                  "MockV3Aggregator"
              )

              mockV3Aggregator = await ethers.getContractAt(
                  mockV3AggregatorDeploy.abi,
                  mockV3AggregatorDeploy.address,
                  deployer
              )
          })

          describe("constructor", async function () {
              it("Sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.target)
              })
          })

          describe("fund", async () => {
              it("Fails if you dont send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              it("Updated the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  //console.log("hola")
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer.address
                  )

                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds funder to array of getFunder", async () => {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer.address)
              })
          })
          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("Withdraw ETH from a single founder", async () => {
                  //Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.getAddress())
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer.getAddress())

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionRecipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe
                  )

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
              })
              it("Allows us to withdraw with multiple getFunder", async () => {
                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.getAddress())
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer.getAddress())
                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionRecipt
                  const gasCost = gasUsed * gasPrice
                  //Assert
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe
                  )

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
                  //Make sure that the getFunder are resset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  /*const attacker = accounts[1]

            const attackerConnectedContract = await fundMe.connect(attacker)*/
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )

                  await fundMeConnectedContract.fund({ value: sendValue })
                  await expect(
                      fundMeConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner") //Flipa con esta linea
              })
              it("Cheaper withdraw testing...", async () => {
                  //Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.getAddress())
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer.getAddress())
                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionRecipt
                  const gasCost = gasUsed * gasPrice
                  //Assert
                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe
                  )

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
                  //Make sure that the getFunder are resset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
              it("Cheaper Withdraw ETH from a single founder", async () => {
                  //Arrange
                  const startingFundMeBalance =
                      await ethers.provider.getBalance(fundMe.getAddress())
                  const startingDeployerBalance =
                      await ethers.provider.getBalance(deployer.getAddress())

                  //Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionRecipt = await transactionResponse.wait(1)
                  const { gasUsed, gasPrice } = transactionRecipt
                  const gasCost = gasUsed * gasPrice

                  const endingFundMeBalance = await ethers.provider.getBalance(
                      fundMe
                  )

                  const endingDeployerBalance =
                      await ethers.provider.getBalance(deployer)
                  //Assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance + startingDeployerBalance,
                      endingDeployerBalance + gasCost
                  )
              })
          })
      })
