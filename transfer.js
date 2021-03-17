// Load libraries and helpers
const fs = require("fs")
const client = require("./client")
const avalanche = require("avalanche")
const binTools = avalanche.BinTools.getInstance()

// Path where we keep the credentials for the pathway
const credentialsPath = "./credentials"

async function main() {
  // 1. Init keychain
  // Initialize chain components
    const chain = client.XChain()
    const keychain = chain.keyChain()

    // Import X-chain key from the previously created file
    const data = JSON.parse(fs.readFileSync(`${credentialsPath}/keypair.json`))
    const key = keychain.importKey(data.privkey)
  // 2. Prepare transaction
  // Fetch UTXO (i.e unspent transaction outputs)
const address = key.getAddressString()
const { utxos } = await chain.getUTXOs(address)
// Prepare transaction details
const receiver = "X-fuji1j2zasjlkkvptegp6dpm222q6sn02k0rp9fj92d" // Pathway test receiver address
const amount = "50000000" // Total amount we're transferring = 0.05 AVAX
const asset = "AVAX" // Primary asset used for the transaction (Avalanche supports many)
// Determine the real asset ID from its symbol/alias
// We can also get the primary asset ID with chain.getAVAXAssetID() call
const assetInfo = await chain.getAssetDescription(asset)
const assetID = binTools.cb58Encode(assetInfo.assetID)
// Fetch our current balance
let balance = await chain.getBalance(address, assetID)
console.log("Balance before sending tx:", balance)
// Generate a new transaction
const unsignedTx = await chain.buildBaseTx(
    utxos, // unspent outputs
    new avalanche.BN(amount), // transaction amount formatted as a BigNumber
    assetID, // AVAX asset
    [receiver], // addresses to send the funds
    [address], // addresses being used to send the funds from the UTXOs provided
    [address], // addresses that can spend the change remaining from the spent UTXOs
    binTools.stringToBuffer("Figment Pathway") // memo, totally optional
  )
  // 3. Send transaction to network
  // Generate a signed transaction
const signedTx = unsignedTx.sign(keychain)
// Send transaction to network
const txID = await chain.issueTx(signedTx)
console.log("Transaction submitted!")
console.log("----------------------------------------------------------------")
console.log(`Visit https://explorer.avax-test.network/tx/${txID} to see transaction details`)
console.log("----------------------------------------------------------------")
// Check transaction status
let status = await chain.getTxStatus(txID)
console.log("Current transaction status:", status)

// Wait 2s
setTimeout(async function() {
  // Check status again
  status = await chain.getTxStatus(txID)
  console.log("Updated transaction status:", status)

  // Final balance check
  balance = await chain.getBalance(address, assetID)
  console.log("Balance after sending tx:", balance)
}, 2000)
}

main().catch((err) => {
  console.log("We have encountered an error!")
  console.error(err)
})