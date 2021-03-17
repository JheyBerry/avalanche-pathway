const fs = require("fs")

// Load and configure Avalanche client
const client = require("./client")

// Path where we will keep the credentials for the pathway
const credentialsPath = "./credentials"

async function main() {
  // 1. Configure keychain
  // Initialize the X-Chain client and keychain
  const chain = client.XChain()
  const keyChain = chain.keyChain()
  const keyPath = `${credentialsPath}/keypair.json`
  // 2. Generate private key
  // Check if we already have an existing key
  if (!fs.existsSync(keyPath)) {
    console.log("Generating a new keypair...")
    const key = keyChain.makeKey()

    console.log("Saving keypair to", keyPath)
    fs.writeFileSync(keyPath, JSON.stringify({
      pubkey: key.getPublicKeyString(),
      privkey: key.getPrivateKeyString(),
    }, null, 2))
  }

  console.log("Loading credentials into keychain...")
  const data = JSON.parse(fs.readFileSync(keyPath))

  const key = keyChain.importKey(data.privkey)
  console.log("Imported X-chain address:", key.getAddressString())
  // 3. Check address balance
  console.log("Fetching address balances...")
  const balances = await chain.getAllBalances(key.getAddressString())

  if (balances.length > 0) {
    console.log(balances)
  } else {
    console.log("Address does not have any associated balances yet.")
    console.log("==============================================================")
    console.log("Visit https://faucet.avax-test.network/ to pre-fund your address.")
    console.log("==============================================================")
  }
}

main().catch((err) => {
  console.log("We have encountered an error!")
  console.error(err)
})
