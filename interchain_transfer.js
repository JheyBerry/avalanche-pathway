// Load libraries and helpers
const fs = require("fs")
const avalanche = require("avalanche")
const client = require("./client")
const ethUtil = require("ethereumjs-util")
const binTools = avalanche.BinTools.getInstance()

// Path where we keep the credentials for the pathway
const credentialsPath = "./credentials"

async function main() {
  // 1. Init keychain
  // Initialize chain components
const xChain = client.XChain()
const xKeychain = xChain.keyChain()
const cChain = client.CChain()
const cKeychain = cChain.keyChain()

// Import keypair from the previously created file
const data = JSON.parse(fs.readFileSync(`${credentialsPath}/keypair.json`))
xKeychain.importKey(data.privkey)
cKeychain.importKey(data.privkey)
  // 2. Init Eth key for the C-Chain
  // Derive Eth-like address from the private key
  const keyBuff = binTools.cb58Decode(data.privkey.split('-')[1])
  const ethAddr = ethUtil.Address.fromPrivateKey(Buffer.from(keyBuff, "hex")).toString("hex")
  console.log("Derived Eth address:", ethAddr)
  // 3. Perform transfer
  // Create a X->C export transaction
await createExport(client, xChain, xKeychain, cKeychain)

// Add some delay to let the transaction clear first, then perform the import
setTimeout(async function() {
  await createImport(client, cChain, cKeychain, ethAddr)

  console.log("----------------------------------------------------------------")
  console.log(`Visit https://cchain.explorer.avax-test.network/address/${ethAddr} for balance details`)
  console.log("----------------------------------------------------------------")
}, 3000)
}

async function createExport(client, xChain, xKeychain, cKeychain) {
    // Prepare transaction details
const amount = "50000000" // Total amount we're transferring = 0.05 AVAX
const asset = "AVAX" // Primary asset used for the transaction (Avalanche supports many)

// Fetch UTXOs (i.e unspent transaction outputs)
const addresses = xKeychain.getAddressStrings()
const utxos = (await xChain.getUTXOs(addresses)).utxos

// Determine the real asset ID from its symbol/alias
const assetInfo = await xChain.getAssetDescription(asset)
const assetID = avalanche.BinTools.getInstance().cb58Encode(assetInfo.assetID)

// Fetch current balance
let balance = await xChain.getBalance(addresses[0], assetID)
console.log("Current X-Chain balance:", balance)

// Get the real ID for the destination chain
const destinationChain = await client.Info().getBlockchainID("C")

// Prepare the export transaction from X -> C chain
const exportTx = await xChain.buildExportTx(
  utxos, // Unspent transaction outpouts
  new avalanche.BN(amount), // Transfer amount
  destinationChain, // Target chain ID (for C-Chain)
  cKeychain.getAddressStrings(), // Addresses being used to send the funds from the UTXOs provided
  xKeychain.getAddressStrings(), // Aaddresses being used to send the funds from the UTXOs provided
  xKeychain.getAddressStrings(), // Addresses that can spend the change remaining from the spent UTXOs
)

// Sign and send the transaction
  const exportTxID = await xChain.issueTx(exportTx.sign(xKeychain))
  console.log("X-Chain export TX:", exportTxID)
  console.log(` - https://explorer.avax-test.network/tx/${exportTxID}`)
  // Will fill later
}

async function createImport(client, cChain, cKeychain, address) {
    // Get the real ID for the source chain
const sourceChain = await client.Info().getBlockchainID("X")

// Fetch UTXOs (i.e unspent transaction outputs)
const { utxos } = await cChain.getUTXOs(cKeychain.getAddressStrings(), sourceChain)

// Generate an unsigned import transaction
const importTx = await cChain.buildImportTx(
  utxos,
  address,
  cKeychain.getAddressStrings(),
  sourceChain,
  cKeychain.getAddressStrings()
)

// Sign and send import transaction
const importTX = await cChain.issueTx(importTx.sign(cKeychain))
console.log("C-Chain import TX:", importTX)
console.log(` - https://explorer.avax-test.network/tx/${importTX}`)
  // Will fill later
}

main().catch((err) => {
  console.log("We have encountered an error!")
  console.error(err)
})