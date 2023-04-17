<script lang="ts">
  import { BigNumber, Contract, ethers, providers } from "ethers";
  import { getLatestSyncedHeader } from "../../utils/getLatestSyncedHeader";
  import StatusIndicator from "../../components/StatusIndicator.svelte";
  import { watchHeaderSynced } from "../../utils/watchHeaderSynced";
  import { getPendingTransactions } from "../../utils/getPendingTransactions";
  import { getBlockFee } from "../../utils/getBlockFee";
  import { getAvailableSlots } from "../../utils/getAvailableSlots";
  import { getPendingBlocks } from "../../utils/getPendingBlocks";
  import { getLastVerifiedBlockId } from "../../utils/getLastVerifiedBlockId";
  import { getNextBlockId } from "../../utils/getNextBlockId";
  import { getGasPrice } from "../../utils/getGasPrice";
  import { getQueuedTransactions } from "../../utils/getQueuedTransactions";
  import { onDestroy, onMount } from "svelte";
  import { getProofReward } from "../../utils/getProofReward";
  import type { Status, StatusIndicatorProp } from "../../domain/status";
  import { getStateVariables } from "../../utils/getStateVariables";
  import { truncateString } from "../../utils/truncateString";
  import TaikoL1 from "../../constants/abi/TaikoL1";
  import DetailsModal from "../../components/DetailsModal.svelte";
  import { addressSubsection } from "../../utils/addressSubsection";
  import Web3 from "web3";
  import ProgressBar from "progressbar.js";
  // import Prover from "src/components/details/Prover.svelte";
  // import Node from "src/components/details/Node.svelte";
  // import Proposer from "src/components/details/Proposer.svelte";
  // export let l1Provider: ethers.providers.JsonRpcProvider;
  // export let l1TaikoAddress: string;
  // export let l2Provider: ethers.providers.JsonRpcProvider;
  // export let l2TaikoAddress: string;
  // export let l1ExplorerUrl: string;
  // export let l2ExplorerUrl: string;
  // export let feeTokenSymbol: string;
  // export let oracleProverAddress: string;

  // Retrieve a single metric value from Prometheus
  // const peers = getSingleMetric({
  //   url: "http://localhost:9090/api/v1",
  //   name: "node_cpu_seconds_total",
  //   label: "mode",
  //   value: "system",
  // });

  const nodeTypes = {
    Node: 0,
    Proposer: 1,
    Prover: 2,
  };

  let peers = 0;
  let blockNumber;
  let syncingStatus;
  let syncingProgress = 0;
  let L1Balance;
  let L2Balance;
  let nodeType = nodeTypes.Node;
  let interval: NodeJS.Timer;

  const myNode = new Web3("http://localhost:8545");
  const taikoL2 = new Web3("https://l2rpc.a2.taiko.xyz");
  const taikoL1 = new Web3("https://l1rpc.a2.taiko.xyz");

  async function fetchMetric() {
    L1Balance =
      parseInt(
        await taikoL1.eth.getBalance(
          "0x2b253d77323abc934f43dcd896636d38ac84972e"
        )
      ) / 1000000000000000000;
    L2Balance =
      parseInt(
        await taikoL2.eth.getBalance(
          "0x2b253d77323abc934f43dcd896636d38ac84972e"
        )
      ) / 1000000000000000000;

    syncingStatus = await myNode.eth.isSyncing();
    syncingProgress =
      (syncingStatus.currentBlock / syncingStatus.highestBlock) * 100;
    blockNumber = await taikoL2.eth.getBlockNumber();
    console.log(await myNode.eth.getNodeInfo());
    // returns: Geth/v1.10.26-stable/linux-amd64/go1.18.10
    // can maybe be used to check for updates?
    console.log(await taikoL2.eth.getNodeInfo());
  }
  onMount(async () => {
    // Interval to fetch metrics every second
    interval = setInterval(async () => {
      try {
        // fetchMetric();

        // let response = await fetch(
        //   "http://localhost:9090/api/v1/query?query=p2p_peers"
        // );
        // let data = await response.json();
        // let value = data.data.result[0].value[1];
        // peers = value;

        if (syncingProgress < 100) {
          syncingProgress++;
        }
      } catch (e) {
        console.error(e);
      }
    }, 100);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="flex flex-col items-center py-6">
  <div class="text-center">
    <img src="./src/assets/TaikoLogo.png" alt="" width="350px" />
    <div class="block nodeTypes flex justify-evenly mt-4">
      <button
        class:active={nodeType === nodeTypes.Node}
        on:click={() => (nodeType = nodeTypes.Node)}>Node</button
      >
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <button
        class:active={nodeType === nodeTypes.Proposer}
        on:click={() => (nodeType = nodeTypes.Proposer)}>Proposer</button
      >
      <button
        class:active={nodeType === nodeTypes.Prover}
        on:click={() => (nodeType = nodeTypes.Prover)}>Prover</button
      >
    </div>
  </div>
  <!-- Progress Bar -->
  <!-- <div id="progressParent" class="pt-5">
    <div class="progress-bar" style={`width: ${syncingProgress}%`} />
  </div> -->
  <div class="progress-bar m-4">
    <div class="progress-bar__background">
      <div class="progress-bar__text">
        {syncingProgress < 100 ? syncingProgress + "%" : "Synced!"}
      </div>
    </div>
    <div class="progress-bar__fill" style={`width: ${syncingProgress}%`} />
  </div>

  <!-- Temporary generic metrics -->
  <!-- ToDO: abstract away and cleanup -->
  <div class="gap-4 text-center my-10">
    {#if peers}
      <p>Peers: {peers}</p>
    {/if}
    {#if blockNumber}
      <p>Total blocks: {blockNumber}</p>
    {/if}
    {#if syncingStatus}
      <p>Node block: {syncingStatus.currentBlock}</p>
      <p>
        Progress: {syncingProgress.toFixed(2)}%
      </p>
    {:else}
      <!-- <p>Synced!</p> -->
    {/if}
    {#if L1Balance && L2Balance}
      <p>L1 Balance: {L1Balance.toFixed(6)} ETH</p>
      <p>L2 Balance: {L2Balance.toFixed(6)} ETH</p>
    {/if}
  </div>

  <!-- Show the node details/metrics -->
  <!-- {#if nodeType === nodeTypes.Prover}
    <Prover />
  {:else if nodeType === nodeTypes.Proposer}
    <Proposer />
  {:else if nodeType === nodeTypes.Node}
    <Node />
  {/if} -->
</div>

<style>
  .nodeTypes {
    color: gray;
    font-weight: lighter;
  }

  .nodeTypes .active {
    border: 1px solid #ff9fe9;
    border-radius: 5px;
    background-color: #ff9fe9;
    color: white;
    font-weight: bold;
    padding: 1px 10px;
  }

  .progress-bar {
    width: 200px;
    height: 20px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
  }

  .progress-bar__background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #e0e0e0;
    border-radius: 10px;
  }

  .progress-bar__fill {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #ff9fe9;
    border-radius: 10px;
    transition: width 0.2s ease-in-out;
    width: 0%;
    z-index: 1;
  }

  .progress-bar__text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    color: white;
    z-index: 2;
  }
</style>
