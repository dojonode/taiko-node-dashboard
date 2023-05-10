<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { queryPrometheus } from "../../utils/prometheus";
  import DetailsModal from "../../components/DetailsModal.svelte";
  import Web3 from "web3";
  import Card from "../../components/Card.svelte";
  import Progressbar from "../../components/Progressbar.svelte";
  import taikoLogo from "../../assets/TaikoLogo.png";
  import purseIcon from "../../assets/icons/Purse.png";
  import heartIcon from "../../assets/icons/Heart.png";
  import brainIcon from "../../assets/icons/Brain.png";
  import dollsIcon from "../../assets/icons/Dolls.png";
  import checkmarkIcon from "../../assets/icons/Check_Mark.png";
  import fileboxIcon from "../../assets/icons/File_Box.png";
  import loadingIcon from "../../assets/icons/Loading.png";
  import medalIcon from "../../assets/icons/Medal.png";
  import chainIcon from "../../assets/icons/Chain.png";
  import packageIcon from "../../assets/icons/Package.png";
  import recyclingIcon from "../../assets/icons/Recycling.png";
  import timerclockIcon from "../../assets/icons/Timer_Clock.png";
  import warningIcon from "../../assets/icons/Warning.png";
  import Gear from "../../components/icons/Gear.svelte";
  import { MetricTypes } from "../../domain/metrics";

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

  const NodeTypes = {
    Node: 0,
    Proposer: 1,
    Prover: 2,
  };

  // ToDO: strip this interface to the necesary items?
  interface Systeminfo {
    mem: {
      total: number;
      free: number;
      used: number;
      active: number;
      available: number;
      buffers: number;
      cached: number;
      slab: number;
      buffcache: number;
      swaptotal: number;
      swapused: number;
      swapfree: number;
    };
    cpu: {
      avgLoad: number;
      currentLoad: number;
      currentLoadUser: number;
      currentLoadSystem: number;
      currentLoadNice: number;
      currentLoadIdle: number;
      currentLoadIrq: number;
      rawCurrentLoad: number;
      rawCurrentLoadUser: number;
      rawCurrentLoadSystem: number;
      rawCurrentLoadNice: number;
      rawCurrentLoadIdle: number;
      rawCurrentLoadIrq: number;
      cpus: {
        load: number;
        loadUser: number;
        loadSystem: number;
        loadNice: number;
        loadIdle: number;
        loadIrq: number;
        rawLoad: number;
        rawLoadUser: number;
        rawLoadSystem: number;
        rawLoadNice: number;
        rawLoadIdle: number;
        rawLoadIrq: number;
      }[];
    };
    disk: {
      fs: string;
      type: string;
      size: number;
      used: number;
      available: number;
      use: number;
      mount: string;
      rw: boolean;
    };
    startTime: number;
  }

  interface SysteminformationMetrics {
    memUsedGB: number;
    memUsedPerc: number;
    cpuUsedPerc: number;
    filestorageFreeGB: number;
    filestorageUsedGB: number;
    filestorageUsedPerc: number;
    runtime: number;
    runtimeMetricType: any;
  }

  // Prometheus metrics
  let peers = null;
  let systemMemoryUsed = null;

  let blockNumber;
  let syncingStatus;
  let syncingProgress = 0;
  let L1Wallet;
  let L2Wallet;
  let L1Balance;
  let L2Balance;
  let addressProposedBlocks;
  let addressProvenBlocks;
  let nodeType = NodeTypes.Node;
  let themeMode = "light";
  let interval: NodeJS.Timer;
  let settingsOpen: boolean = false;
  let systeminfo: Systeminfo;
  let systeminformationMetrics: SysteminformationMetrics = null;
  let imageRef;

  // layout variables
  let bigLayout = true;
  let rotationAngle = 0; // used to rotate the taiko logo

  // ToDO: figure out what RPCs will be used by default, give the user an option in the settings to switch to a new RPC
  const myNode = new Web3("http://localhost:8545");
  // Temporary RPC while waiting for next testnet, using an alchemy rpc
  const ethRPC = new Web3("https://eth.llamarpc.com");
  // const ethRPC = new Web3(import.meta.env.L1_ENDPOINT_WS);
  // Will be used by default
  const L2TaikoRPC = new Web3("https://l2rpc.a3.taiko.xyz");
  const L1TaikoRPC = new Web3("https://l1rpc.a3.taiko.xyz");

  async function fetchMetric() {
    // Fetch metrics from API endpoint
    if (L1Wallet) {
      L1Balance =
        parseInt(await ethRPC.eth.getBalance(L1Wallet)) / 1000000000000000000;
    } else {
      L1Balance = null;
    }
    if (L2Wallet) {
      L2Balance =
        parseInt(await ethRPC.eth.getBalance(L2Wallet)) / 1000000000000000000;
    } else {
      L2Balance = null;
    }

    // ToDO: use the L2TaikoRPC and compare once testnet is live, check for a difference during syncing?
    // blockNumber = await myNode.eth.getBlockNumber();

    // L2Balance =
    //   parseInt(
    //     await taikoL2.eth.getBalance(
    //       "0x2b253d77323abc934f43dcd896636d38ac84972e"
    //     )
    //   ) / 1000000000000000000;
    syncingStatus = await myNode.eth.isSyncing();
    syncingProgress =
      (syncingStatus.currentBlock / syncingStatus.highestBlock) * 100;
    console.log(syncingStatus);
    // blockNumber = await taikoL2.eth.getBlockNumber();
    // console.log(await myNode.eth.getNodeInfo());
    // // returns: Geth/v1.10.26-stable/linux-amd64/go1.18.10
    // // can maybe be used to check for updates?
    // console.log(await taikoL2.eth.getNodeInfo());
  }

  // This function will fetch from the nodejs api that exposes system metrics using the npm package systeminformation
  const fetchAddressEvents = async () => {
    try {
      const response = await fetch(
        "https://eventindexer.a3.taiko.xyz/uniqueProvers",
        {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers":
              "Origin, X-Requested-With, Content-Type, Accept",
          },
        }
      );
      let addressEvent = await response.json();
      // if event === proposed
      // addressProposedBlocks = addressEvent.count
      // else if event === proven
      // addressProvenBlocks = addressEvent.count
      console.log(addressEvent);
    } catch (error) {
      console.error("Error fetching system info", error);
    }
  };
  const fetchSystemInfo = async () => {
    try {
      const response = await fetch("http://localhost:3009/metrics", {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers":
            "Origin, X-Requested-With, Content-Type, Accept",
        },
      });
      systeminfo = await response.json();
      console.log(systeminfo);

      const usedMemoryGB =
        (systeminfo.mem.total - systeminfo.mem.available) / 1024 / 1024 / 1024;
      const usedMemoryPercent =
        ((systeminfo.mem.total - systeminfo.mem.available) /
          systeminfo.mem.total) *
        100;
      const cpuPercent = systeminfo.cpu.currentLoad;

      const usedSpace = systeminfo.disk[0].used / 1024 / 1024 / 1024;
      const freeSpaceGB =
        (systeminfo.disk[0].size - systeminfo.disk[0].used) /
        1024 /
        1024 /
        1024;
      const usedPercentage = systeminfo.disk[0].use;

      const currentTime: number = Math.floor(Date.now() / 1000);
      const secondsElapsed: number = currentTime - systeminfo.startTime;
      const runtimeInHours = secondsElapsed / 3600;
      const runtime =
        runtimeInHours >= 1 ? runtimeInHours : runtimeInHours * 60;
      console.log(currentTime, secondsElapsed, runtimeInHours);

      systeminformationMetrics = {
        memUsedGB: Number(usedMemoryGB.toFixed(2)),
        memUsedPerc: Number(usedMemoryPercent.toFixed(2)),
        cpuUsedPerc: Number(cpuPercent.toFixed(2)),
        filestorageFreeGB: Number(freeSpaceGB.toFixed(2)),
        filestorageUsedGB: Number(usedSpace.toFixed(2)),
        filestorageUsedPerc: Number(usedPercentage.toFixed(2)),
        runtime: Number(runtime.toFixed(0)),
        runtimeMetricType:
          runtimeInHours >= 1 ? MetricTypes.hours : MetricTypes.minutes,
      };
    } catch (error) {
      console.error("Error fetching system info", error);
    }
  };
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
  // fetchMetric();
  onMount(async () => {
    // Interval to fetch metrics every second
    interval = setInterval(async () => {
      try {
        fetchMetric();
        // fetchSystemInfo();
        // Try fetching all the prometheus metrics, in case something goes wrong, we set all the properties to "" so the cards are empty/show error
        // ToDO: in case 1 metric fails, all the metrics are erased => any better solutions?
        try {
          const [peersData] = await Promise.all([
            queryPrometheus("p2p_peers"),
            // queryPrometheus("system_memory_used"),
          ]);
          peers = peersData.data.result[0].value[1];
          // using the node to fetch systemmemory leads to inaccurate results, that's why we use the NodeJS api
          // let systemMemoryUsedMB =
          //   systemMemoryUsedData.data.result[0].value[1] / 8000000;
          // systemMemoryUsed = `${systemMemoryUsedMB.toFixed(0)} MB`;
        } catch (error) {
          // ToDO: Show alerts/notifications when something went wrong fetching the prometheus metric(s)?
          peers = "";
          // systemMemoryUsed = "";
        }
        if (syncingProgress < 100) {
          syncingProgress++;
        }
      } catch (e) {
        console.error(e);
      }
    }, 3000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="flex flex-col items-center pt-4">
  <div class="text-center relative">
    <img
      bind:this={imageRef}
      src={taikoLogo}
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
  <div class="my-4">
    <Progressbar
      progress={syncingStatus ? syncingProgress : 100}
      precision={0}
      showPercentage={true}
      finishedMessage="Synced!"
    />
  </div>

  <div class="{bigLayout ? 'max-w-[46rem]' : 'max-w-[35rem]'} relative">
    <button
      class="w-6 h-6 absolute right-[7px] top-[-37px] cursor-pointer"
      on:click={() => (settingsOpen = true)}
    >
      <Gear class="fill-[#9baab2]" />
    </button>

    <div class="mt-[1px] flex flex-wrap">
      <Card
        title="Memory"
        body={`${systeminformationMetrics?.memUsedGB}`}
        bodyMetricType={MetricTypes.gigabyte}
        subBody={`${systeminformationMetrics?.memUsedPerc}`}
        subBodyMetricType={MetricTypes.percentage}
        icon={brainIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.memUsedPerc}
      />
      <Card
        title="CPU"
        body={`${systeminformationMetrics?.cpuUsedPerc}`}
        bodyMetricType={MetricTypes.percentage}
        icon={heartIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.cpuUsedPerc}
      />
      <Card
        title="Peers"
        body={peers}
        bodyMetricType={MetricTypes.peers}
        icon={dollsIcon}
        loadingbar={false}
      />
      <Card
        title="Storage"
        body={`${systeminformationMetrics?.filestorageUsedGB}`}
        bodyMetricType={MetricTypes.gigabyte}
        subBody={`${systeminformationMetrics?.filestorageUsedPerc}`}
        subBodyMetricType={MetricTypes.percentage}
        icon={fileboxIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.filestorageUsedPerc}
      />
      <Card
        title="Runtime"
        body={`${systeminformationMetrics?.runtime}`}
        bodyMetricType={systeminformationMetrics?.runtimeMetricType}
        icon={timerclockIcon}
        loadingbar={false}
      />
      <Card
        title="Blockheight"
        body={`${blockNumber}`}
        bodyMetricType={MetricTypes.blockheight}
        icon={chainIcon}
        loadingbar={false}
      />
      <Card
        title="Wallet"
        body={L1Balance?.toFixed(3)}
        bodyMetricType={MetricTypes.ethereum}
        subBody={L2Balance?.toFixed(3)}
        subBodyMetricType={MetricTypes.ethereum}
        icon={purseIcon}
        loadingbar={false}
      />
      {#if nodeType === NodeTypes.Proposer}
        <Card
          title="Proposed"
          body={`${10}`}
          bodyMetricType={MetricTypes.proposer}
          icon={packageIcon}
          loadingbar={false}
        />
      {:else if nodeType === NodeTypes.Prover}
        <Card
          title="Proven"
          body={`${10}`}
          bodyMetricType={MetricTypes.prover}
          icon={packageIcon}
          loadingbar={false}
        />
      {/if}
      <!-- <Card
        title="Earned"
        body="4.588"
        bodyMetricType={MetricTypes.taiko}
        icon={medalIcon}
        loadingbar={false}
      /> -->
    </div>
  </div>
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
            bind:value={L1Wallet}
          />
        </div>
      </div>
      <div class="flex justify-between items-center font-bold">
        Set L2 address:
        <div class="">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            bind:value={L2Wallet}
          />
        </div>
      </div>
      <div class="flex justify-between items-center font-bold">
        Layout:
        <div class="inline-flex">
          <button
            class:active={!bigLayout}
            on:click={() => (bigLayout = false)}
            class="layout bg-zinc-50 hover:bg-zinc-200 text-zinc-800 py-2 px-4 mx-1 rounded-l"
          >
            compact
          </button>
          <button
            class:active={bigLayout}
            on:click={() => (bigLayout = true)}
            class="layout bg-zinc-50 hover:bg-zinc-200 text-zinc-800 py-2 px-4 mx-1 rounded-r"
          >
            wide
          </button>
        </div>
      </div>
      <!-- Theme switcher -->
      <!-- <div class="flex justify-between items-center font-bold">
        Theme:
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
      </div> -->
      <!-- <button
        class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border w-[33%] mx-auto mt-5 border-gray-400 rounded shadow"
        >Save</button
      > -->
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

  .layout.active {
    background-color: rgb(255, 250, 207);
  }
  /* .theme.active {
    background-color: rgb(212 212 216);
  } */
</style>
