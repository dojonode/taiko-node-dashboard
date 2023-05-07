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
  import { queryPrometheus } from "../../utils/prometheus";
  import type { Status, StatusIndicatorProp } from "../../domain/status";
  import { getStateVariables } from "../../utils/getStateVariables";
  import { truncateString } from "../../utils/truncateString";
  import TaikoL1 from "../../constants/abi/TaikoL1";
  import DetailsModal from "../../components/DetailsModal.svelte";
  import { addressSubsection } from "../../utils/addressSubsection";
  import Web3 from "web3";
  import Card from "../../components/Card.svelte";
  import Progressbar from "../../components/Progressbar.svelte";
  import purseIcon from "../../assets/icons/purse.png";
  import heartIcon from "../../assets/icons/heart.png";
  import brainIcon from "../../assets/icons/brain.png";
  import peopleIcon from "../../assets/icons/people.png";
  import checkmarkIcon from "../../assets/icons/check_mark.png";
  import fileboxIcon from "../../assets/icons/file_box.png";
  import loadingIcon from "../../assets/icons/loading.png";
  import medalIcon from "../../assets/icons/medal.png";
  import packageIcon from "../../assets/icons/package.png";
  import recyclingIcon from "../../assets/icons/recycling.png";
  import timerclockIcon from "../../assets/icons/timer_clock.png";
  import warningIcon from "../../assets/icons/warning.png";
  import Gear from "../../components/icons/Gear.svelte";
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

  const NodeTypes = {
    Node: 0,
    Proposer: 1,
    Prover: 2,
  };

  interface SysteminformationMetrics {
    memUsedGB: number;
    memUsedPerc: number;
    cpuUsedPerc: number;
  }

  // Prometheus metrics
  let peers = null;
  let systemMemoryUsed = null;

  let blockNumber;
  let syncingStatus;
  let syncingProgress = 0;
  let L1Balance;
  let L2Balance;
  let nodeType = NodeTypes.Node;
  let themeMode = "light";
  let interval: NodeJS.Timer;
  let imageRef;
  let settingsOpen: boolean = false;
  let systeminformationMetrics: SysteminformationMetrics = null;

  const myNode = new Web3("http://localhost:8545");
  const taikoL2 = new Web3("https://l2rpc.a2.taiko.xyz");
  const taikoL1 = new Web3("https://l1rpc.a2.taiko.xyz");

  // fetch("http://localhost:3009/metrics")
  //   .then((response) => response.json())
  //   .then((data) => {
  //     console.log("dataaa", data);
  //     systeminformationMetrics = data;
  //   })
  //   .catch((error) => console.log(error));
  // console.log(systeminformationMetrics);
  // console.log("hi??");

  async function fetchMetric() {
    // Fetch metrics from API endpoint
    // L1Balance =
    //   parseInt(
    //     await taikoL1.eth.getBalance(
    //       "0x2b253d77323abc934f43dcd896636d38ac84972e"
    //     )
    //   ) / 1000000000000000000;
    // L2Balance =
    //   parseInt(
    //     await taikoL2.eth.getBalance(
    //       "0x2b253d77323abc934f43dcd896636d38ac84972e"
    //     )
    //   ) / 1000000000000000000;
    // syncingStatus = await myNode.eth.isSyncing();
    // syncingProgress =
    //   (syncingStatus.currentBlock / syncingStatus.highestBlock) * 100;
    // blockNumber = await taikoL2.eth.getBlockNumber();
    // console.log(await myNode.eth.getNodeInfo());
    // // returns: Geth/v1.10.26-stable/linux-amd64/go1.18.10
    // // can maybe be used to check for updates?
    // console.log(await taikoL2.eth.getNodeInfo());
  }

  let rotationAngle = 0;
  const fetchSystemInfo = async () => {
    try {
      console.log("trying??");
      const response = await fetch("http://localhost:3009/metrics", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        },
      });
      console.log(response);
      systeminformationMetrics = await response.json();
      console.log(systeminformationMetrics);
    } catch (error) {
      console.error("Error fetching system info", error);
    }
  };
  fetchSystemInfo();
  function switchNodeType(type) {
    if (nodeType === type) return;

    syncingProgress = 0;
    rotationAngle += 120;
    imageRef.style.transformOrigin = "center 130px";
    // imageRef.style.transformOrigin = "center 115px";
    imageRef.style.transform = `rotate(${rotationAngle}deg)`;

    switch (type) {
      case NodeTypes.Node:
        nodeType = NodeTypes.Node;
        break;
      case NodeTypes.Proposer:
        nodeType = NodeTypes.Proposer;
        break;
      case NodeTypes.Prover:
        nodeType = NodeTypes.Prover;
        break;
      default:
        break;
    }
  }

  onMount(async () => {
    // Interval to fetch metrics every second
    // interval = setInterval(async () => {
    //   try {
    //     // fetchMetric();
    //     // Try fetching all the prometheus metrics, in case something goes wrong, we set all the properties to "" so the cards are empty/show error
    //     // ToDO: in case 1 metric fails, all the metrics are erased => any better solutions?
    //     try {
    //       const [peersData, systemMemoryUsedData] = await Promise.all([
    //         queryPrometheus("p2p_peers"),
    //         queryPrometheus("system_memory_used"),
    //       ]);
    //       peers = peersData.data.result[0].value[1];
    //       // Convert bits to MegaBytes
    //       // ToDO: support gigabytes
    //       let systemMemoryUsedMB =
    //         systemMemoryUsedData.data.result[0].value[1] / 8000000;
    //       systemMemoryUsed = `${systemMemoryUsedMB.toFixed(0)} MB`;
    //     } catch (error) {
    //       // ToDO: Show alerts/notifications when something went wrong fetching the prometheus metric(s)?
    //       peers = "";
    //       systemMemoryUsed = "";
    //     }
    //     if (syncingProgress < 100) {
    //       syncingProgress++;
    //     }
    //   } catch (e) {
    //     console.log("or here?");
    //     console.error(e);
    //   }
    // }, 1000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="flex flex-col items-center pt-4">
  <div class="text-center relative">
    <img
      bind:this={imageRef}
      src="./src/assets/TaikoLogo.png"
      class="taikoImg"
      alt=""
      width="230px"
    />
    <div class="nodeTypes flex justify-evenly mt-4">
      <button
        class:active={nodeType === NodeTypes.Node}
        on:click={() => switchNodeType(NodeTypes.Node)}>node</button
      >
      <span class="bar" />
      <button
        class:active={nodeType === NodeTypes.Proposer}
        on:click={() => switchNodeType(NodeTypes.Proposer)}>proposer</button
      >
      <span class="bar" />
      <button
        class:active={nodeType === NodeTypes.Prover}
        on:click={() => switchNodeType(NodeTypes.Prover)}>prover</button
      >
    </div>
  </div>

  <!-- Progress Bar -->
  <Progressbar
    progress={syncingProgress}
    showPercentage={true}
    finishedMessage="Synced!"
  />

  <!-- Temporary generic metrics to try things out -->
  <!-- <div class="gap-1 text-center my-10">
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
      <p>Synced!</p>
    {/if}
    {#if L1Balance && L2Balance}
      <p>L1 Balance: {L1Balance.toFixed(6)} ETH</p>
      <p>L2 Balance: {L2Balance.toFixed(6)} ETH</p>
    {/if}
  </div> -->
  <div class="max-w-[552px] relative">
    <button
      class="w-6 h-6 absolute right-[7px] top-[-37px] cursor-pointer"
      on:click={() => (settingsOpen = true)}
    >
      <Gear class="fill-[#9baab2]" />
    </button>

    <div class="mt-[1px] flex flex-wrap">
      <Card
        title="Memory"
        body="{systeminformationMetrics?.memUsedGB} GB"
        subBody="{systeminformationMetrics?.memUsedPerc} %"
        icon={brainIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.memUsedPerc}
      />
      <Card
        title="CPU"
        body="{systeminformationMetrics?.cpuUsedPerc} %"
        icon={heartIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.cpuUsedPerc}
      />
      <Card
        title="Peers"
        body={peers}
        subBody="connected"
        icon={peopleIcon}
        loadingbar={false}
      />
      <Card
        title="Runtime"
        body="10 Hrs"
        icon={timerclockIcon}
        loadingbar={false}
      />
      <Card
        title="Storage"
        body="500 GB"
        subBody="25%"
        icon={fileboxIcon}
        loadingbar={true}
        progress={25}
      />
      <Card
        title="Wallet"
        body="0.487 ETH"
        icon={purseIcon}
        loadingbar={false}
      />
      <Card
        title="Earned"
        body="4.588 TKO"
        icon={medalIcon}
        loadingbar={false}
      />
    </div>
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

{#if settingsOpen}
  <DetailsModal title={"Settings"} bind:isOpen={settingsOpen}>
    <div
      class="grid grid-cols-1 gap-6 mx-5 my-10 max-h-96 overflow-y-auto"
      slot="body"
    >
      <div class="flex justify-between items-center font-bold">
        Set L1 address:
        <div class="">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
          />
        </div>
      </div>
      <div class="flex justify-between items-center font-bold">
        Set L2 address:
        <div class="">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
          />
        </div>
      </div>
      <div class="flex justify-between items-center font-bold">
        Theme:
        <!-- <div class="">
          <button class="mx-1">Light</button>
          <button class="mx-1">Dark</button>
          <button class="mx-1">Paper</button>
          
        </div> -->
        <div class="inline-flex">
          <button
            class:active={themeMode === "light"}
            on:click={() => (themeMode = "light")}
            class="theme bg-zinc-50 hover:bg-zinc-200 text-zinc-800 py-2 px-4 mx-1 rounded-l"
          >
            Light
          </button>
          <button
            class:active={themeMode === "dark"}
            on:click={() => (themeMode = "dark")}
            class="theme bg-zinc-50 hover:bg-zinc-200 text-zinc-800 py-2 px-4 mx-1 rounded-r"
          >
            Dark
          </button>
          <button
            class:active={themeMode === "paper"}
            on:click={() => (themeMode = "paper")}
            class="theme bg-zinc-50 hover:bg-zinc-200 text-zinc-800 py-2 px-4 mx-1 rounded-r"
          >
            Paper
          </button>
        </div>
      </div>
      <button
        class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border w-[33%] mx-auto mt-5 border-gray-400 rounded shadow"
        >Save</button
      >
    </div>
  </DetailsModal>
{/if}

<style>
  .nodeTypes {
    color: gray;
    font-weight: lighter;
    z-index: 1;
    position: relative;
  }

  .nodeTypes .active {
    /* border: 1px solid #ff9fe9;
    border-radius: 5px;
    padding: 1px 10px;
    background-color: #ff9fe9;
    color: white; */
    color: #ff9fe9;
    font-weight: bold;
  }

  .nodeTypes .bar {
    margin-top: auto;
    margin-bottom: auto;
    width: 2px;
    height: 15px;
    background-color: gray;
  }

  .taikoImg {
    transition: transform 0.5s ease-in-out;
  }

  .theme.active {
    background-color: rgb(212 212 216);
    /* background-color: rgb(228 228 231); */
  }
</style>
