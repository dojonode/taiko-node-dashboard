<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { queryPrometheus } from "../../utils/prometheus";
  import {
    setLocalStorageItem,
    getLocalStorageItem,
  } from "../../utils/localstorage";
  import DetailsModal from "../../components/DetailsModal.svelte";
  import Web3 from "web3";
  import Card from "../../components/Card.svelte";
  import ThemeSwitcher from "../../components/ThemeSwitcher.svelte";
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
  import abacusIcon from "../../assets/icons/Abacus.png";
  import gasIcon from "../../assets/icons/Gas.png";
  import timerclockIcon from "../../assets/icons/Timer_Clock.png";
  import warningIcon from "../../assets/icons/Warning.png";
  import Gear from "../../components/icons/Gear.svelte";
  import { MetricTypes, NodeTypes, Themes } from "../../domain/enums";
  import type {
    Systeminfo,
    SysteminformationMetricsInterface,
  } from "../../domain/types";
  import { Sortable } from "@shopify/draggable";
  // TODO: figure out what RPCs will be used by default, give the user an option in the settings to switch to a new RPC
  const myNode = new Web3("http://localhost:8545");
  // Temporary RPC while waiting for next testnet, using an alchemy rpc
  const ethRPC = new Web3("https://eth.llamarpc.com");
  // const ethRPC = new Web3(import.meta.env.L1_ENDPOINT_WS);
  // Will be used by default
  const L2TaikoRPC = new Web3("https://l2rpc.a3.taiko.xyz");
  const L1TaikoRPC = new Web3("https://l1rpc.a3.taiko.xyz");

  // Prometheus metrics
  let peers = null;
  let systemMemoryUsed = null;

  let blockNumber;
  let gasPrice;
  let syncingStatus;
  let syncingProgress = 0;
  // nodeAddress is the wallet address read out from the .env file used for the node
  let nodeAddress;

  // If we find a private key variable in the .env we use this for the nodeAddress
  if (import.meta.env.VITE_PRIVATE_KEY) {
    nodeAddress = ethRPC.eth.accounts.privateKeyToAccount(
      import.meta.env.VITE_PRIVATE_KEY
    ).address;
  } else {
    // no private key found, so no default wallet
    nodeAddress = null;
  }

  let useCustomAddress = false;
  let customAddressL1;
  let customAddressL2;
  // reactive declarations of the L1Wallet and L2Wallet that will re-calculate their values each time one of the reactive dependencies (useCustomAddress, customAddressL1, or nodeAddress) changes
  $: L1Wallet = useCustomAddress ? customAddressL1 : nodeAddress;
  $: L2Wallet = useCustomAddress ? customAddressL2 : nodeAddress;
  let L1Balance;
  let L2Balance;
  let addressProposedBlocksCount;
  let addressProvenBlocksCount;
  // set the nodeType to what is used within the .env file
  let enableProver: boolean = JSON.parse(import.meta.env.VITE_ENABLE_PROVER);
  let enableProposer: boolean = JSON.parse(
    import.meta.env.VITE_ENABLE_PROPOSER
  );
  let nodeType = enableProver
    ? NodeTypes.Prover
    : enableProposer
    ? NodeTypes.Proposer
    : NodeTypes.Node;

  let interval: NodeJS.Timer;
  let systeminfo: Systeminfo;
  let systeminformationMetrics: SysteminformationMetricsInterface = null;

  // layout variables
  let bigLayout = false;
  let rotationAngle = 0; // used to rotate the taiko logo
  let themeMode = "light";
  let settingsOpen: boolean = false;
  let imageRef;

  async function fetchMetric() {
    // Fetch metrics from API endpoint
    if (L1Wallet) {
      L1Balance = Number(
        ethRPC.utils.fromWei(await ethRPC.eth.getBalance(L1Wallet), "ether")
      );
    } else {
      L1Balance = null;
    }
    if (L2Wallet) {
      L2Balance = Number(
        ethRPC.utils.fromWei(await ethRPC.eth.getBalance(L2Wallet), "ether")
      );
    } else {
      L2Balance = null;
    }

    gasPrice = Number(
      ethRPC.utils.fromWei(await ethRPC.eth.getGasPrice(), "gwei")
    );
    // TODO: use the L2TaikoRPC and compare once testnet is live, check for a difference during syncing?
    blockNumber = await myNode.eth.getBlockNumber();
    syncingStatus = await myNode.eth.isSyncing();
    syncingProgress =
      (syncingStatus.currentBlock / syncingStatus.highestBlock) * 100;
    // console.log(syncingStatus);
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
      // console.log(addressEvent);
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
      // console.log(systeminfo);

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

    // syncingProgress = 0;
    rotationAngle += 120;
    // imageRef.style.transformOrigin = "center 130px";
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
    useCustomAddress = JSON.parse(getLocalStorageItem("useCustomAddress"));
    customAddressL1 = getLocalStorageItem("customAddressL1");
    customAddressL2 = getLocalStorageItem("customAddressL2");

    const sortable = new Sortable(document.querySelectorAll("#cards"), {
      draggable: ".card",
    });

    // Interval to fetch metrics every second
    interval = setInterval(async () => {
      try {
        fetchMetric();
        fetchSystemInfo();

        // Try fetching all the prometheus metrics, in case something goes wrong, we set all the properties to "" so the cards are empty/show error
        // TODO: in case 1 metric fails, all the metrics are erased => any better solutions?
        try {
          const peersData = await queryPrometheus("p2p_peers");
          peers = peersData.data.result[0].value[1];
        } catch (error) {
          // TODO: Show alerts/notifications when something went wrong fetching the prometheus metric(s)?
          peers = "";
        }

        // if (syncingProgress < 100) {
        // syncingProgress++;
        // }
      } catch (e) {
        console.error(e);
      }
    }, 5000);
  });

  onDestroy(() => {
    if (interval) clearInterval(interval);
  });
</script>

<div class="flex flex-col items-center pt-4">
  <div class="text-center relative">
    <img bind:this={imageRef} src={taikoLogo} class="taikoImg mx-auto" alt="" />
    <div class="nodeTypes flex justify-evenly mt-4">
      <button
        class:active={nodeType === NodeTypes.Node}
        on:click={() => switchNodeType(NodeTypes.Node)}>node</button
      >
      <span class="bar">|</span>
      <button
        class:active={nodeType === NodeTypes.Proposer}
        on:click={() => switchNodeType(NodeTypes.Proposer)}>proposer</button
      >
      <span class="bar">|</span>
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
      precision={2}
      showPercentage={true}
      finishedMessage="Synced!"
    />
  </div>

  <div
    class="{bigLayout
      ? 'max-w-[46rem]'
      : 'max-w-[35rem]'} relative sm:justify-center"
  >
    <button
      id="settingsBtn"
      class="w-6 h-6 absolute right-[7px] top-[-37px] cursor-pointer"
      on:click={() => (settingsOpen = true)}
    >
      <Gear class="fill-[hsl(var(--twc-settingsBtnColor))]" />
    </button>

    <div id="cards" class="mt-[1px] flex flex-wrap justify-center">
      <Card
        title="memory"
        body={`${systeminformationMetrics?.memUsedGB}`}
        bodyMetricType={MetricTypes.gigabyte}
        subBody={`${systeminformationMetrics?.memUsedPerc}`}
        subBodyMetricType={MetricTypes.percentage}
        icon={brainIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.memUsedPerc}
      />
      <Card
        title="cpu"
        body={`${systeminformationMetrics?.cpuUsedPerc}`}
        bodyMetricType={MetricTypes.percentage}
        icon={heartIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.cpuUsedPerc}
      />
      <Card
        title="storage"
        body={`${systeminformationMetrics?.filestorageUsedGB}`}
        bodyMetricType={MetricTypes.gigabyte}
        subBody={`${systeminformationMetrics?.filestorageUsedPerc}`}
        subBodyMetricType={MetricTypes.percentage}
        icon={fileboxIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.filestorageUsedPerc}
      />
      <Card
        title="runtime"
        body={`${systeminformationMetrics?.runtime}`}
        bodyMetricType={systeminformationMetrics?.runtimeMetricType}
        icon={timerclockIcon}
        loadingbar={false}
      />
      <Card
        title="peers"
        body={peers}
        bodyMetricType={MetricTypes.peers}
        icon={dollsIcon}
        loadingbar={false}
      />
      <Card
        title="blockheight"
        body={`${blockNumber}`}
        bodyMetricType={MetricTypes.blockheight}
        icon={chainIcon}
        loadingbar={false}
      />
      <!-- node is either a prover or a proposr -->
      {#if nodeType === NodeTypes.Proposer || nodeType === NodeTypes.Prover}
        <Card
          title="wallet"
          body={L1Balance?.toFixed(3)}
          bodyMetricType={MetricTypes.ethereum}
          subBody={L2Balance?.toFixed(3)}
          subBodyMetricType={MetricTypes.ethereum}
          icon={purseIcon}
          loadingbar={false}
          {L1Wallet}
          {L2Wallet}
        />
      {/if}
      <!-- node is a proposer -->
      {#if nodeType === NodeTypes.Proposer}
        <Card
          title="proposed"
          body={`${10}`}
          bodyMetricType={MetricTypes.proposer}
          icon={packageIcon}
          loadingbar={false}
        />
        <!-- node is a prover -->
      {:else if nodeType === NodeTypes.Prover}
        <Card
          title="proven"
          body={`${10}`}
          bodyMetricType={MetricTypes.prover}
          icon={abacusIcon}
          loadingbar={false}
        />
      {/if}
      <Card
        title="Gas"
        body={`${gasPrice?.toFixed(2)}`}
        bodyMetricType={MetricTypes.gas}
        icon={gasIcon}
        loadingbar={false}
      />
      <!-- Invisble cards that push any incomplete rows of cards to the left -->
      <div class="invisible">
        <Card />
      </div>
      <div class="invisible">
        <Card />
      </div>
      <div class="invisible">
        <Card />
      </div>
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
        Address used by node:
        <div class="ml-2 w-[75%]">
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-[hsl(var(--twc-settingsSecondaryTextColor))] leading-tight focus:outline-none focus:shadow-outline placeholder:font-normal"
            type="text"
            value={nodeAddress}
            disabled
            placeholder="no address found"
          />

          <div class="text-[hsl(var(--twc-settingsSecondaryTextColor))]">
            <input
              class="accent-[hsl(var(--twc-settingsButtonColorActive))]"
              type="checkbox"
              bind:checked={useCustomAddress}
              on:change={() =>
                setLocalStorageItem(
                  "useCustomAddress",
                  String(useCustomAddress)
                )}
            />
            Use custom address
          </div>
        </div>
      </div>
      {#if useCustomAddress}
        <div class="flex justify-between items-center font-bold">
          Set L1 address:
          <div class="ml-2 w-[75%]">
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-[hsl(var(--twc-settingsSecondaryTextColor))] leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              readonly={!useCustomAddress}
              bind:value={customAddressL1}
              on:change={() =>
                setLocalStorageItem("customAddressL1", customAddressL1)}
            />
          </div>
        </div>
        <div class="flex justify-between items-center font-bold">
          Set L2 address:
          <div class="ml-2 w-[75%]">
            <input
              class="shadow appearance-none border rounded w-full py-2 px-3 text-[hsl(var(--twc-settingsSecondaryTextColor))] leading-tight focus:outline-none focus:shadow-outline"
              type="text"
              readonly={!useCustomAddress}
              bind:value={customAddressL2}
              on:change={() =>
                setLocalStorageItem("customAddressL2", customAddressL2)}
            />
          </div>
        </div>
      {/if}

      <div class="flex justify-between items-center font-bold">
        Layout:
        <div class="inline-flex">
          <button
            class:active={!bigLayout}
            on:click={() => (bigLayout = false)}
            class="layout bg-zinc-50 hover:bg-zinc-100 text-zinc-800 py-2 px-4 mx-1 rounded-l"
          >
            compact
          </button>
          <button
            class:active={bigLayout}
            on:click={() => (bigLayout = true)}
            class="layout bg-zinc-50 hover:bg-zinc-100 text-zinc-800 py-2 px-4 mx-1 rounded-r"
          >
            wide
          </button>
        </div>
      </div>
      <!-- Theme switcher -->
      <ThemeSwitcher />
    </div>
  </DetailsModal>
{/if}

<style>
  .nodeTypes {
    color: gray;
    font-weight: 400;
    z-index: 1;
    position: relative;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
  }

  .nodeTypes .active {
    color: hsl(var(--twc-secondaryColor));
    font-weight: 700;
  }

  .nodeTypes .bar {
    margin-top: auto;
    margin-bottom: auto;
    color: hsl(var(--twc-tertiaryColor));
    font-weight: 400;
  }

  .taikoImg {
    transition: transform 0.5s ease-in-out;
    transform-origin: center 130px;
    width: 230px;
  }

  .layout.active {
    background-color: rgb(255, 250, 207);
  }

  @media (max-width: 550px) {
    .taikoImg {
      width: 130px;
      transform-origin: center 74px;
    }
  }
</style>
