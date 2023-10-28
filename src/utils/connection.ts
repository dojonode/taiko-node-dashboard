import Web3 from "web3";

export async function initializeRPCConnection(url) {
  try {
    const web3Instance = new Web3(url);
    let fetchErrorBoolean = false;

    await web3Instance.eth.net.isListening().then(() => {
      fetchErrorBoolean = false;
    });

    return { web3Instance, fetchErrorBoolean };
  } catch (error) {
    console.error(error);
    return { web3Instance: null, fetchErrorBoolean: true };
  }
}
