<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import * as simpleDuration from "simple-duration";
  import confetti from "canvas-confetti";
  import { queryPrometheus } from "../utils/prometheus";
  import { initializeRPCConnection } from "../utils/connection";
  import {
    setLocalStorageItem,
    getLocalStorageItem,
  } from "../utils/localstorage";
  import DetailsModal from "../components/DetailsModal.svelte";
  import Card from "../components/Card.svelte";
  import ThemeSwitcher from "../components/ThemeSwitcher.svelte";
  import Progressbar from "../components/Progressbar.svelte";
  import Footer from "../components/Footer.svelte";
  import TaikoLogo from "../components/icons/TaikoLogo.svelte";
  import Gear from "../components/icons/Gear.svelte";
  import purseIcon from "../assets/icons/Purse.png";
  import heartIcon from "../assets/icons/Heart.png";
  import brainIcon from "../assets/icons/Brain.png";
  import dollsIcon from "../assets/icons/Dolls.png";
  import checkmarkIcon from "../assets/icons/Check_Mark.png";
  import fileboxIcon from "../assets/icons/File_Box.png";
  import chainIcon from "../assets/icons/Chain.png";
  import taikoLogoIcon from "../assets/taikoLogoIcon.png";
  import packageIcon from "../assets/icons/Package.png";
  import abacusIcon from "../assets/icons/Abacus.png";
  import gasIcon from "../assets/icons/Gas.png";
  import timerclockIcon from "../assets/icons/Timer_Clock.png";
  import warningIcon from "../assets/icons/Warning.png";
  import antennaIcon from "../assets/icons/Antenna.png";
  import { MetricTypes, NodeTypes } from "../domain/enums";
  import type {
    Systeminfo,
    SysteminformationMetricsInterface,
  } from "../domain/types";
  import {
    ETH_RPC_API_URL,
    L2_TAIKO_RPC_API_URL,
    MYNODE_API_URL,
    PROMETHEUS_API_URL,
    SYSTEMINFO_API_URL,
    EVENT_INDEXER_API_URL,
  } from "../domain/constants";

  const urlParams = new URLSearchParams(window.location.search);
  let expertModeCounter = 0;
  let expertMode = false;
  let myNode;
  let ethRPC;
  let L2TaikoRPC;
  let fetchMetricsError = false;
  let fetchSystemInfoError = false;
  let fetchPrometheusError = false;
  let fetchMyNodeError = false;
  let fetchEthRPCError = false;
  let fetchL2TaikoRPCError = false;
  let fetchEventIndexerError = false;

  // Syncing estimation
  let startNodeHeight;
  let startTime = Date.now();
  let currentNodeheight;
  let currentTime;
  let estimatedSyncingTime;

  // if custom localstorage API urls exist, use those, else use the default variables from the constants.ts file
  let CUSTOM_ETH_RPC_API_URL =
    getLocalStorageItem("CUSTOM_ETH_RPC_API_URL") || ETH_RPC_API_URL;
  let CUSTOM_MYNODE_API_URL =
    getLocalStorageItem("CUSTOM_MYNODE_API_URL") || MYNODE_API_URL;
  let CUSTOM_PROMETHEUS_API_URL =
    getLocalStorageItem("CUSTOM_PROMETHEUS_API_URL") || PROMETHEUS_API_URL;
  let CUSTOM_SYSTEMINFO_API_URL =
    getLocalStorageItem("CUSTOM_SYSTEMINFO_API_URL") || SYSTEMINFO_API_URL;
  let CUSTOM_EVENT_INDEXER_API_URL =
    getLocalStorageItem("CUSTOM_EVENT_INDEXER_API_URL") ||
    EVENT_INDEXER_API_URL;

  function enableExpertMode() {
    expertMode = true;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  }

  // Initialize the web3 RPC connections with error handling to see if we have provided a valid RPC provider
  async function initConnections() {
    const myNodeResponse = await initializeRPCConnection(CUSTOM_MYNODE_API_URL);
    const ethRPCResponse = await initializeRPCConnection(CUSTOM_ETH_RPC_API_URL);
    const L2TaikoRPCResponse = await initializeRPCConnection(L2_TAIKO_RPC_API_URL);

    // Set the web3 RPC instances
    myNode = myNodeResponse.web3Instance;
    ethRPC = ethRPCResponse.web3Instance;
    L2TaikoRPC = L2TaikoRPCResponse.web3Instance;

    // Set the response errors
    fetchMyNodeError = myNodeResponse.fetchErrorBoolean;
    fetchEthRPCError = ethRPCResponse.fetchErrorBoolean;
    fetchL2TaikoRPCError = L2TaikoRPCResponse.fetchErrorBoolean;

    if(fetchL2TaikoRPCError)
      console.error(`Error while connecting to the L2 Taiko RPC ${L2_TAIKO_RPC_API_URL}. This dashboard version might be outdated, reach out in the taiko discord if the issue persists.`);
  }

  // Prometheus metric
  let peers = null;

  // General metrics
  let nodeHeight: number;
  let chainHeight;
  let gasPrice;
  let syncingStatus;
  let syncingProgress = 0;
  let customAddressL1 = getLocalStorageItem("customAddressL1");
  let customAddressL2 = getLocalStorageItem("customAddressL2");

  // TODO: remove 'any' types
  let L1Balance;
  let L2Balance;
  let addressBlockProposedCount;
  let addressBlockProvenCount;
  let nodeType = NodeTypes.Node;

  if (getLocalStorageItem("nodeType")) {
    nodeType = getLocalStorageItem("nodeType");
  }

  let intervalTimer: NodeJS.Timer;
  let systeminfo: Systeminfo;
  let systeminformationMetrics: SysteminformationMetricsInterface = null;

  // layout variables
  let bigLayout = false;
  let rotationAngle = 0; // used to rotate the taiko logo
  let settingsOpen =
    nodeType !== NodeTypes.Node &&
    (customAddressL1 === null || customAddressL1 === "");

  let connectionsOpen: boolean = false;
  let imageRef: HTMLImageElement;

  // fetch general metrics from the node RPCs
  async function fetchMetrics() {
    try {
      if (customAddressL1) {
        L1Balance = Number(
          ethRPC?.utils.fromWei(
            await ethRPC?.eth.getBalance(customAddressL1),
            "ether",
          ),
        );
      } else {
        L1Balance = null;
      }
      if (customAddressL2) {
        // Use the taiko RPC to be reliable, node that's not synced will display false numbers
        L2Balance = Number(
          L2TaikoRPC?.utils.fromWei(
            await L2TaikoRPC?.eth.getBalance(customAddressL2),
            "ether",
          ),
        );
      } else {
        L2Balance = null;
      }

      gasPrice = Number(
        ethRPC?.utils.fromWei(await ethRPC?.eth.getGasPrice(), "gwei"),
      );
      nodeHeight = await myNode.eth.getBlockNumber();
      chainHeight = await L2TaikoRPC.eth.getBlockNumber();

      /*
        Workaround to fix the initial 5mins where the node displays as synced but it hasn't even started syncing yet
        check if there is a huge difference between myNode blocknumber and taiko rpc blocknumber while it's showing as not syncing
      */
      if (
        chainHeight - nodeHeight > 100 &&
        (await myNode.eth.isSyncing()) === false
      ) {
        syncingStatus = undefined;
      } else {
        syncingStatus = await myNode.eth.isSyncing();
      }
      if (syncingStatus !== undefined && syncingStatus !== null) {
        syncingProgress =
          (syncingStatus.currentBlock / syncingStatus.highestBlock) * 100;
      }

      // Estimate how long until node is synced, but only if the nodeheight is more than 100 blocks behind the chainHeight
      if (chainHeight - nodeHeight > 100) {
        currentNodeheight = nodeHeight;
        currentTime = Date.now();
        const blocksDownloaded = Number(nodeHeight) - Number(startNodeHeight);
        const blocksRemaining = Number(chainHeight) - Number(startNodeHeight);
        const downloadProgress = blocksDownloaded / blocksRemaining;

        //only calculate after 5s and when the downloadProgress is bigger than 0, to be more accurate
        const timeElapsed = currentTime - startTime;
        if (timeElapsed > 5000 && downloadProgress > 0) {
          const estimatedTotalTime = timeElapsed / downloadProgress;
          estimatedSyncingTime = simpleDuration.stringify(
            estimatedTotalTime / 1000,
            "m",
          );
        }
      }
    } catch (error) {
      console.error("Error while fetching RPC metrics", error);
      syncingStatus = null;
    }
  }

  const fetchAddressEvents = async () => {
    // Fetch Amount Of blocks proposed/proven, so if nodeType is regular node return and do nothing
    if (nodeType === NodeTypes.Node) return;

    const event = nodeType === NodeTypes.Proposer ? "BlockProposed" : nodeType === NodeTypes.Prover ? "BlockProven" : "";
    const eventIndexerEventURL = `${CUSTOM_EVENT_INDEXER_API_URL}/eventByAddress?address=${customAddressL1}&event=${event}`;

    try {
      const response = await fetch(eventIndexerEventURL);

      if (response.status === 200) {
        const addressEvent = await response.json();

      if (nodeType === NodeTypes.Proposer) addressBlockProposedCount = addressEvent.count;
      else if (nodeType === NodeTypes.Prover) addressBlockProvenCount = addressEvent.count;

        fetchEventIndexerError = false;
      } else {
        fetchEventIndexerError = true;
        throw new Error("couldn't reach the eventindexer url");
      }
    } catch (error) {
      fetchEventIndexerError = true;
      console.error(
        `Error fetching address events for the ${nodeType} at ${eventIndexerEventURL}`,
        error,
      );
    }
  };

  // fetch from the nodejs api that exposes system metrics using the npm package systeminformation
  async function fetchSystemInfo() {
    try {
      const response = await fetch(`${CUSTOM_SYSTEMINFO_API_URL}/metrics`);
      const systemInfo = await response.json();

      const mem = systemInfo.mem;
      const disk = systemInfo.disk[0];
      const currentTime = Math.floor(Date.now() / 1000);
      const secondsElapsed = currentTime - systemInfo.startTime;
      const runtimeInHours = secondsElapsed / 3600;
      const runtime = runtimeInHours >= 1 ? runtimeInHours : runtimeInHours * 60;

      systeminformationMetrics = {
        memUsedGB: Number(((mem.total - mem.available) / 1024 / 1024 / 1024).toFixed(2)),
        memUsedPerc: Number((((mem.total - mem.available) / mem.total) * 100).toFixed(2)),
        cpuUsedPerc: Number(systemInfo.cpu.currentLoad.toFixed(2)),
        filestorageFreeGB: Number(((disk.size - disk.used) / 1024 / 1024 / 1024).toFixed(2)),
        filestorageUsedGB: Number((disk.used / 1024 / 1024 / 1024).toFixed(2)),
        filestorageUsedPerc: Number(disk.use.toFixed(2)),
        runtime: Number(runtime.toFixed(0)),
        runtimeMetricType: runtimeInHours >= 1 ? MetricTypes.hours : MetricTypes.minutes,
      };
      fetchSystemInfoError = false;
    } catch (error) {
      if (!fetchSystemInfoError) {
        console.error("Error while fetching systeminfo", error);
        fetchSystemInfoError = true;
      }
    }
  }

  // Fetch from prometheus
  const fetchPrometheus = async () => {
    try {
      const peersData = await queryPrometheus(
        CUSTOM_PROMETHEUS_API_URL,
        "p2p_peers",
      );

      // Check if we can find the p2p_peers value in the result, throw error if response is undefined
      if (peersData?.data?.result?.[0]?.value?.[1] === undefined)
        throw new Error("Value p2p_peers not found in the Prometheus response");

      peers = peersData.data.result[0].value[1];
      fetchPrometheusError = false;
    } catch (error) {
      peers = "";

      if (!fetchPrometheusError) {
        console.error("Error while fetching prometheus", error);
        fetchPrometheusError = true;
      }
    }
  };

  // switching the nodetype, rotates the taiko logo and reveals/hides certain cards
  function switchNodeType(type) {
    if (nodeType === type) return;

    // used to rotate the taiko logo correctly
    rotationAngle += 120;
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

    // Open the settings popup if no address is defined or if it's empty
    settingsOpen =
      nodeType !== NodeTypes.Node &&
      (customAddressL1 === null || customAddressL1 === "");

    setLocalStorageItem("nodeType", nodeType);
  }

  onMount(async () => {
    // override the current params with urlParams if user provides an IP param
    // example url: http://.../?ip=192.168.1.1&nodePort=8546&prometheusPort=9090
    if (urlParams.has("ip")) {
      const ip = urlParams.get("ip");
      const nodePort = urlParams.get("nodePort") || 8548;
      const prometheusPort = urlParams.get("prometheusPort") || 9091;
      const systeminformationPort =
        urlParams.get("systeminformationPort") || 3009;

      CUSTOM_MYNODE_API_URL = `ws://${ip}:${nodePort}`;
      CUSTOM_PROMETHEUS_API_URL = `http://${ip}:${prometheusPort}`;
      CUSTOM_SYSTEMINFO_API_URL = `http://${ip}:${systeminformationPort}`;
    }

    // Initialize the RPC connections
    await initConnections();

    // Set startNodeHeight of the node if the RPC is successfully set
    if(!fetchMyNodeError)
      myNode.eth.getBlockNumber().then((height) => (startNodeHeight = height));

    // Interval to fetch metrics every 5 seconds
    intervalTimer = setInterval(async () => {
      try {
        // TODO: add if checks for the fetchMyNodeError etc. before fetching data
        fetchMetrics();
        fetchSystemInfo();
        fetchPrometheus();
        fetchAddressEvents();

        // If there were errors connecting to node, we will occasionally re-try initializing the RPC connections
        if (fetchMyNodeError) initConnections();
      } catch (e) {
        console.error(e);
      }
    }, 5000);
  });

  onDestroy(() => {
    if (intervalTimer) clearInterval(intervalTimer as any);
  });
</script>

<div class="flex flex-col items-center">
  <div class="text-center relative pt-4 md:pt-10">
    <img
      bind:this={imageRef}
      src={taikoLogoIcon}
      class="taikoImg mx-auto"
      alt=""
    />

    <TaikoLogo
      class="fill-[hsl(var(--twc-textColor))] w-32 mx-auto mt-[10px]"
    />
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
  <!--
    the progress can only be displayed if the syncingrequest has been made and the node can be found
    -> first check if the request was made: !== undefined
    -> check if the node is found: !== null
    -> check if the node is syncing: syncingStatus === true

    use a -1 value to display the loading or node not found values
   -->
  <div class="my-4 text-center">
    <Progressbar
      progress={syncingStatus === undefined
        ? (Number(nodeHeight) / Number(chainHeight)) * 100
        : syncingStatus === null
        ? -1
        : syncingStatus
        ? syncingProgress
        : 100}
      precision={2}
      showPercentage={true}
      finishedMessage={syncingStatus === undefined
        ? "preparing to sync..."
        : syncingStatus === null
        ? "node not found"
        : "synced!"}
    />
    {#if estimatedSyncingTime && syncingStatus}
      <span class="text-[12px] text-[hsl(var(--twc-cardSubBodyColor))]"
        >{estimatedSyncingTime}</span
      >
    {/if}
  </div>

  <div
    class="{bigLayout
      ? "max-w-[46rem]"
      : "max-w-[35rem]"} sticky sm:justify-center"
  >
    <button
      id="connectionsBtn"
      class="w-6 h-6 absolute right-[40px] top-[-37px] cursor-pointer"
      on:click={() => (connectionsOpen = true)}
    >
      <img
        src={antennaIcon}
        class={fetchMetricsError ||
        fetchSystemInfoError ||
        fetchPrometheusError ||
        fetchMyNodeError ||
        fetchEthRPCError ||
        fetchEventIndexerError
          ? "animateConnections"
          : ""}
        alt="antenna icon"
      />
    </button>

    <button
      id="settingsBtn"
      class="w-6 h-6 absolute right-[7px] top-[-37px] cursor-pointer"
      on:click={() => (settingsOpen = true)}
    >
      <Gear class="fill-[hsl(var(--twc-settingsBtnColor))]" />
    </button>

    <div
      id="cards"
      class="mt-[1px] flex flex-wrap justify-center overflow-y-clip"
    >
      <Card
        title="memory"
        body={systeminformationMetrics?.memUsedGB}
        bodyMetricType={MetricTypes.gigabyte}
        subBody={systeminformationMetrics?.memUsedPerc}
        subBodyMetricType={MetricTypes.percentage}
        icon={brainIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.memUsedPerc}
      />
      <Card
        title="cpu"
        body={systeminformationMetrics?.cpuUsedPerc}
        bodyMetricType={MetricTypes.percentage}
        icon={heartIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.cpuUsedPerc}
      />
      <Card
        title="storage"
        body={systeminformationMetrics?.filestorageUsedGB}
        bodyMetricType={MetricTypes.gigabyte}
        subBody={systeminformationMetrics?.filestorageUsedPerc}
        subBodyMetricType={MetricTypes.percentage}
        icon={fileboxIcon}
        loadingbar={true}
        progress={systeminformationMetrics?.filestorageUsedPerc}
      />
      <Card
        title="runtime"
        body={systeminformationMetrics?.runtime}
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
        title="nodeheight"
        body={nodeHeight}
        bodyMetricType={MetricTypes.blockheight}
        subBody={chainHeight}
        subBodyMetricType={MetricTypes.blockheight}
        icon={chainIcon}
        loadingbar={false}
      />
      <!-- node is either a prover or a proposer -->
      {#if nodeType === NodeTypes.Proposer || nodeType === NodeTypes.Prover}
        <Card
          title="wallet"
          body={L1Balance}
          bodyMetricType={MetricTypes.ethereum}
          subBody={L2Balance}
          subBodyMetricType={MetricTypes.ethereum}
          icon={purseIcon}
          loadingbar={false}
          {customAddressL1}
          {customAddressL2}
        />
      {/if}
      <!-- node is a proposer -->
      {#if nodeType === NodeTypes.Proposer}
        <Card
          title="proposed"
          body={addressBlockProposedCount}
          bodyMetricType={MetricTypes.proposer}
          icon={packageIcon}
          loadingbar={false}
        />
        <!-- node is a prover -->
      {:else if nodeType === NodeTypes.Prover}
        <Card
          title="proven"
          body={addressBlockProvenCount}
          bodyMetricType={MetricTypes.prover}
          icon={abacusIcon}
          loadingbar={false}
        />
      {/if}
      <Card
        title="gas"
        body={gasPrice}
        bodyMetricType={MetricTypes.gas}
        icon={gasIcon}
        loadingbar={false}
      />
      <!-- Invisible cards that push any incomplete rows of cards to the left -->
      <div class="invisible h-5">
        <Card />
      </div>
      <div class="invisible h-5">
        <Card />
      </div>
      <div class="invisible h-5">
        <Card />
      </div>
    </div>
  </div>
</div>
<Footer />

{#if settingsOpen}
  <DetailsModal title={"settings"} bind:isOpen={settingsOpen}>
    <div
      class="settings grid grid-cols-1 gap-6 mx-5 my-10 max-h-[600px] overflow-y-auto text-[hsl(var(--twc-textColor))] font-semibold"
      slot="body"
    >
      <!-- when the node is a proposer, allow the user to change both L1 and L2 wallet address. Because proposers can receive fees on a different L2 address -->
      <!-- when the node is simply a node or a prover, they can change the address (both L1 and L2) -->
      {#if nodeType === NodeTypes.Proposer}
        <div class="flex flex-col justify-between items-center">
          ethereum address used by {nodeType}
          <div class="mt-2 w-[75%]">
            <input
              class="shadow appearance-none rounded w-full px-3 focus:outline-none focus:shadow-outline leading-none"
              type="text"
              bind:value={customAddressL1}
              on:keyup={() => {
                setLocalStorageItem("customAddressL1", customAddressL1.trim());
                customAddressL2 = customAddressL1;
                setLocalStorageItem("customAddressL2", customAddressL2.trim());
              }}
            />
          </div>
        </div>
      {:else if nodeType === NodeTypes.Prover}
        <div class="flex flex-col justify-between items-center">
          ethereum address used by {nodeType}
          <div class="mt-2 w-[75%]">
            <input
              class="shadow appearance-none rounded w-full px-3 focus:outline-none focus:shadow-outline leading-none"
              type="text"
              bind:value={customAddressL1}
              on:keyup={() => {
                setLocalStorageItem("customAddressL1", customAddressL1.trim());
                customAddressL2 = customAddressL1;
                setLocalStorageItem("customAddressL2", customAddressL2.trim());
              }}
            />
          </div>
        </div>
      {/if}
      <div
        class="flex md:flex-row gap-[15px] md:gap-[50px] flex-col justify-center"
      >
        <div class="flex flex-col justify-between items-center">
          layout
          <div class="mt-2 inline-flex text-black">
            <button
              class:active={!bigLayout}
              on:click={() => {
                expertModeCounter++;
                if (expertModeCounter === 5) enableExpertMode();

                bigLayout = false;
              }}
              class="layout py-[2px] px-1 mx-1 rounded-full"
            >
              compact
            </button>
            <button
              class:active={bigLayout}
              on:click={() => {
                expertModeCounter = 0;
                expertMode = false;
                bigLayout = true;
              }}
              class="layout py-[2px] px-1 mx-1 rounded-full"
            >
              wide
            </button>
          </div>
        </div>
        <!-- Theme switcher to change themes -->
        <ThemeSwitcher />
      </div>
    </div>
  </DetailsModal>
{/if}
{#if connectionsOpen}
  <DetailsModal title={"Connections"} bind:isOpen={connectionsOpen}>
    <div
      class="connections grid grid-cols-1 gap-6 mx-5 my-10 max-h-96 overflow-y-auto text-[hsl(var(--twc-textColor))]"
      slot="body"
    >
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        Node:
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline mt-1"
            type="text"
            bind:value={CUSTOM_MYNODE_API_URL}
            placeholder={MYNODE_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_MYNODE_API_URL",
                CUSTOM_MYNODE_API_URL,
              );
              initConnections();
            }}
          />
          <img
            src={fetchMyNodeError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        Systeminformation:
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            bind:value={CUSTOM_SYSTEMINFO_API_URL}
            placeholder={SYSTEMINFO_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_SYSTEMINFO_API_URL",
                CUSTOM_SYSTEMINFO_API_URL,
              );
            }}
          />
          <img
            src={fetchSystemInfoError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        Prometheus:
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            bind:value={CUSTOM_PROMETHEUS_API_URL}
            placeholder={PROMETHEUS_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_PROMETHEUS_API_URL",
                CUSTOM_PROMETHEUS_API_URL,
              );
            }}
          />
          <img
            src={fetchPrometheusError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        ETH RPC:
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline mb-1"
            type="text"
            bind:value={CUSTOM_ETH_RPC_API_URL}
            placeholder={ETH_RPC_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_ETH_RPC_API_URL",
                CUSTOM_ETH_RPC_API_URL,
              );
              initConnections();
            }}
          />
          <img
            src={fetchEthRPCError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>

      <div
        class="{expertMode
          ? "flex"
          : "hidden"} sm:flex-row flex-col justify-between items-center font-bold"
      >
        Event Indexer:
        <div class="ml-2 w-72 flex items-center">
          <input
            class="shadow appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline mb-1"
            type="text"
            bind:value={CUSTOM_EVENT_INDEXER_API_URL}
            placeholder={EVENT_INDEXER_API_URL}
            on:change={() => {
              setLocalStorageItem(
                "CUSTOM_EVENT_INDEXER_API_URL",
                CUSTOM_EVENT_INDEXER_API_URL,
              );
              initConnections();
            }}
          />
          <img
            src={fetchEventIndexerError ? warningIcon : checkmarkIcon}
            alt="icon"
            class="w-[30px] ml-2"
          />
        </div>
      </div>
    </div>
  </DetailsModal>
{/if}

<style>
  .nodeTypes {
    color: hsl(var(--twc-textColor));
    font-weight: 400;
    z-index: 1;
    position: relative;
    width: 200px;
    margin-left: auto;
    margin-right: auto;
  }

  .nodeTypes .active {
    color: hsl(var(--twc-nodeTypesColorActive));
    font-weight: 700;
  }

  .nodeTypes .bar {
    margin-top: auto;
    margin-bottom: auto;
    color: hsl(var(--twc-textColor));
    font-weight: 400;
  }

  .taikoImg {
    transition: transform 0.5s ease-in-out;
    transform-origin: center 37px;
    width: 65px;
  }

  .layout {
    border: 2.1px solid hsl(var(--twc-cardBackgroundColor));
    background-color: hsl(var(--twc-settingsAccentColor));
    color: hsl(var(--twc-textColor));
    font-weight: 400;
    line-height: 1;
  }
  .layout.active {
    border: 2.1px solid hsl(var(--twc-primaryColor));
    background-color: hsl(var(--twc-cardBackgroundColor));
  }

  .settings button {
    width: 75px;
  }

  .settings input {
    background-color: hsl(var(--twc-settingsAccentColor));
    font-weight: 400;
    text-align: center;
    border-radius: 999px;
  }

  .connections input {
    background-color: hsl(var(--twc-settingsAccentColor));
  }

  .animateConnections {
    animation: animateConnections 1.5s infinite;
  }

  @keyframes animateConnections {
    0% {
      transform: rotate(0deg);
    }
    8.0% {
      transform: rotate(0deg);
    }
    12.0% {
      transform: rotate(35deg);
    }
    16.0% {
      transform: rotate(-30deg);
    }
    20.0% {
      transform: rotate(0deg);
    }
    23.0% {
      transform: rotate(28deg);
    }
    26.0% {
      transform: rotate(-20deg);
    }
    29.0% {
      transform: rotate(0deg);
    }
    31.0% {
      transform: rotate(16deg);
    }
    33.0% {
      transform: rotate(-12deg);
    }
    35.0% {
      transform: rotate(0deg);
    }
    37.0% {
      transform: rotate(-6deg);
    }
    39.0% {
      transform: rotate(0deg);
    }
  }
</style>
