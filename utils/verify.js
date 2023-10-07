const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verifynig contract...")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already")) {
            console.log("Already Verified!")
        } else {
            console.log("The error:")
            console.log("--------------------------")
            console.log(e)
        }
    }
}
module.exports = { verify }
