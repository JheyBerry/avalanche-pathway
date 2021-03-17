// Load Avalanche client helper
const client = require("./client")

async function main() {
  // Initialize the Info API client
  const info = client.Info()

  console.log("Fetching network information...")
  const nodeVersion = await info.getNodeVersion()
  const networkName = await info.getNetworkName()
  const networkID = await info.getNetworkID()
  const networkPeers = await info.peers()

  console.log("\nNetwork info:")
  console.log("* Node version:", nodeVersion)
  console.log("* Network name:", networkName)
  console.log("* Network ID:", networkID)
  console.log("* Connected Peers:", networkPeers.length)
}

main().catch((err) => {
  console.log("We have encountered an error!")
  console.error(err)
})
