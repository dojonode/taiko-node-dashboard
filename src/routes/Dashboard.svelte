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
  import ChainCard from "../components/ChainCard.svelte";
  import ThemeSwitcher from "../components/ThemeSwitcher.svelte";
  import Progressbar from "../components/Progressbar.svelte";
  import Footer from "../components/Footer.svelte";
  import purseIcon from "../assets/icons/Purse.avif";
  import heartIcon from "../assets/icons/Heart.avif";
  import brainIcon from "../assets/icons/Brain.avif";
  import dollsIcon from "../assets/icons/Dolls.avif";
  import checkmarkIcon from "../assets/icons/CheckMark.avif";
  import fileboxIcon from "../assets/icons/FileBox.avif";
  import dojoScrollIcon from "../assets/icons/DojoScroll.svg";
  import chainIcon from "../assets/icons/Chain.avif";
  import nodeTaikoIcon from "../assets/icons/NodeTaiko.avif";
  import packageIcon from "../assets/icons/Package.avif";
  import abacusIcon from "../assets/icons/Abacus.avif";
  import gasIcon from "../assets/icons/Gas.avif";
  import timerclockIcon from "../assets/icons/Timer_Clock.avif";
  import warningIcon from "../assets/icons/Warning.avif";
  import antennaIcon from "../assets/icons/Antenna.avif";
  import { MetricTypes, NodeTypes } from "../domain/enums";
  import headerImage from '../assets/Header.avif';
  import type {
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
  let selected = 'hekla'
  let url;
  let expertMode = false;
  let myNode;
  let ethRPC;
  let L2TaikoRPC;
  let fetchSystemInfoError = false;
  let fetchPrometheusError = false;
  let fetchMyNodeError = false;
  let fetchEthRPCError = false;
  let fetchL2TaikoRPCError = false;
  let fetchEventIndexerError = false;
  $:hasError = fetchSystemInfoError ||
      fetchPrometheusError ||
      fetchMyNodeError ||
      fetchEthRPCError ||
      fetchEventIndexerError;

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
    const timeout = 5000; // Set your maximum time in milliseconds

    const myNodePromise = initializeRPCConnection(CUSTOM_MYNODE_API_URL);
    const ethRPCPromise = initializeRPCConnection(CUSTOM_ETH_RPC_API_URL);
    const L2TaikoRPCPromise = initializeRPCConnection(L2_TAIKO_RPC_API_URL);

    // Start connections concurrently
    const myNodeResponse = Promise.race([
      myNodePromise,
      new Promise(resolve => setTimeout(resolve, timeout, { web3Instance: null, fetchErrorBoolean: true }))
    ]);

    const ethRPCResponse = Promise.race([
      ethRPCPromise,
      new Promise(resolve => setTimeout(resolve, timeout, { web3Instance: null, fetchErrorBoolean: true }))
    ]);

    const L2TaikoRPCResponse = Promise.race([
      L2TaikoRPCPromise,
      new Promise(resolve => setTimeout(resolve, timeout, { web3Instance: null, fetchErrorBoolean: true }))
    ]);

    // Set the web3 RPC instances and handle errors
    myNodeResponse.then((response: any) => {
      myNode = response.web3Instance;
      fetchMyNodeError = response.fetchErrorBoolean;
      if (fetchMyNodeError)
        console.error(`Error while connecting to the NODE RPC at ${CUSTOM_MYNODE_API_URL}. The node IP address or port might be wrong. Or the port might be blocked by a firewall.`);
    });

    ethRPCResponse.then((response: any) => {
      ethRPC = response.web3Instance;
      fetchEthRPCError = response.fetchErrorBoolean;
      if (fetchEthRPCError)
        console.error(`Error while connecting to the ETHEREUM RPC ${CUSTOM_ETH_RPC_API_URL}. Double check the url in the connections tab.`);
    });

    L2TaikoRPCResponse.then((response: any) => {
      L2TaikoRPC = response.web3Instance;
      fetchL2TaikoRPCError = response.fetchErrorBoolean;
      if (fetchL2TaikoRPCError)
        console.error(`Error while connecting to the TAIKO RPC ${L2_TAIKO_RPC_API_URL}. Looks like something is wrong with the official Taiko L2 RPC, check in the discord if this issue persists.`);
    });
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
  let systeminformationMetrics: SysteminformationMetricsInterface = null;

  // layout variables
  let connectionsOpen: boolean = false;

  // fetch general metrics from the node RPCs
  async function fetchMetrics() {
    try {
      // Check if there was an error with the ETH RPC and L2 Taiko RPC connection, before fetching data
      if (!fetchEthRPCError && !fetchL2TaikoRPCError) {
        gasPrice = Number(
          ethRPC?.utils.fromWei(await ethRPC?.eth.getGasPrice(), "gwei"),
        );

        if(customAddressL1 && customAddressL2){
          L1Balance = Number(
            ethRPC?.utils.fromWei(
              await ethRPC?.eth.getBalance(customAddressL1),
              "ether",
            ),
          );

          // Use the taiko RPC to be reliable, a node that's not synced will display false numbers
          L2Balance = Number(
            L2TaikoRPC?.utils.fromWei(
              await L2TaikoRPC?.eth.getBalance(customAddressL2),
              "ether",
            ),
          );
        }
      } else {
        L1Balance = null;
        L2Balance = null;
        gasPrice = null;
      }

      // If there was an error with the Node or L2TaikoRPC, return and set the syncingStatus to null so the progress bar reads 'node not found'
      // This way there aren't made any more calls to offline RPC's before the connection is stable again
      if(fetchMyNodeError || fetchL2TaikoRPCError){
        syncingStatus = null;
        return;
      }

      nodeHeight = await myNode.eth.getBlockNumber();
      // set the startNodeHeight once
      if(startNodeHeight === undefined) startNodeHeight = nodeHeight;
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
    fetchEventIndexerError = false;
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

  function handleNavigation() {
    if (selected === 'mainnet') {
      window.location.href = "http://dashboard.dojonode.xyz";
    } else if (selected === 'hekla') {
      window.location.href = "http://hekla.dojonode.xyz";
    }
  }

  // switching the nodetype, rotates the taiko logo and reveals/hides certain cards
  function switchNodeType(type) {
    if (nodeType === type) return;

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

    setLocalStorageItem("nodeType", nodeType);
  }

  onMount(async () => {
    url = window.location.href;
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

<header class="flex flex-col items-center justify-center w-[90%] m-auto">
  <span>
    <a href="https://dojonode.xyz/shomen">
      <img src={headerImage} class="max-w-full max-h-[20vh] w-auto h-auto mt-2" alt="dojo node header with trees and the logo" />
    </a>
    <div class="w-[60px] ml-auto mr-8 lg:-mb-12 md:mb-4 mb-2">
      <ThemeSwitcher />
    </div>
  </span>
</header>

<div class="flex flex-col items-center">
  <div class="text-center relative pt-4 md:pt-10">
    <section>
      <div class="mx-auto relative">
        <span>
          <span class="text-[#5CAA80] font-bold">dojo</span>
          <img src={dojoScrollIcon} class="icon-big m-auto" alt="dojo flag">
          {#if url?.startsWith('http://dashboard.dojonode.xyz') || url?.startsWith('http://hekla.dojonode.xyz') || url?.startsWith('https://dashboard.dojonode.xyz') || url?.startsWith('https://hekla.dojonode.xyz')}
            <div>
              <select id="networkDropdown" class="mt-2 px-3 py-1 rounded-full" bind:value={selected} on:change={handleNavigation}>
                <option value="mainnet">mainnet</option>
                <option value="hekla">hekla</option>
              </select>
            </div>
          {/if}
        </span>

        <div class="card md:absolute md:top-0 md:left-36 w-max text-balance md:text-left mt-8 mb-2 max-w-[20rem]">
          <h1 class="font-bold">node dashboard</h1>
          <h2 class="-mt-2">the main training area</h2>
        </div>
      </div>
    </section>

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
    class="max-w-[35rem] sticky sm:justify-center"
  >
    <button
      id="connectionsBtn"
      class="w-6 h-6 absolute right-[7px] mr-[6px] top-[-37px] cursor-pointer"
      on:click={() => (connectionsOpen = true)}
    >
      <img
        src={antennaIcon}
        class={hasError
          ? "animateConnections"
          : ""}
        alt="antenna icon"
      />
    </button>

    <div
      id="cards"
      class="mt-[1px] flex flex-wrap justify-center overflow-y-clip"
    >
      <ChainCard
        title="chain"
        body="taiko"
        subBody="hekla"
        icon={nodeTaikoIcon}
      />
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
        title="nodeheight"
        body={nodeHeight}
        bodyMetricType={MetricTypes.blockheight}
        subBody={chainHeight}
        subBodyMetricType={MetricTypes.blockheight}
        icon={chainIcon}
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
        title="runtime"
        body={systeminformationMetrics?.runtime}
        bodyMetricType={systeminformationMetrics?.runtimeMetricType}
        icon={timerclockIcon}
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

{#if connectionsOpen}
  <DetailsModal title={"Connections"} bind:isOpen={connectionsOpen}>
    <div
      class="connections grid grid-cols-1 gap-6 mx-5 my-10 max-h-96 overflow-y-auto text-[hsl(var(--twc-textColor))]"
      slot="body"
    >

    {#if url.startsWith('https://dashboard.dojonode.xyz') }
      <div class="flex items-center">
        <img
        src={warningIcon}
        alt="icon"
        class="w-[30px] h-[30px] mr-2"
        />
        <div>
          it seems like you are using the 'https' version of the hosted dashboard. This will not connect to your node, make sure to use <a class="underline" href="http://dashboard.dojonode.xyz">http://dashboard.dojonode.xyz</a> or <a target="_blank" class="underline" href="https://github.com/dojonode/taiko-node-dashboard-docker/">try selfhosting the dashboard</a>
        </div>
      </div>
    {:else if url.startsWith('https://hekla.dojonode.xyz')}
    <div class="flex items-center">
      <img
      src={warningIcon}
      alt="icon"
      class="w-[30px] h-[30px] mr-2"
      />
      <div>
        it seems like you are using the 'https' version of the hosted dashboard. This will not connect to your node, make sure to use <a class="underline" href="http://hekla.dojonode.xyz">http://hekla.dojonode.xyz</a> or <a target="_blank" class="underline" href="https://github.com/dojonode/taiko-node-dashboard-docker/">try selfhosting the dashboard</a>
      </div>
    </div>
    {/if}

      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        ethereum address
        <div class="ml-2 w-72 flex items-center">
          <input
              class="shadow appearance-none rounded w-full py-2 px-3 focus:outline-none focus:shadow-outline leading-none"
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
      <div
        class="flex sm:flex-row flex-col justify-between items-center font-bold"
      >
        node
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
        systeminformation
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
        prometheus
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
        ethereum RPC
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
    font-weight: 600;
  }

  .nodeTypes .bar {
    margin-top: auto;
    margin-bottom: auto;
    color: hsl(var(--twc-textColor));
    font-weight: 400;
  }

  .connections input {
    background-color: hsl(var(--twc-inputAccentColor));
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

  section {
    color: hsl(var(--twc-textColor));
    display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
		width: 50%;
		margin-left: auto;
		margin-right: auto;
		text-align: center;
	}


  @media only screen and (max-width: 600px) {
    section {
      width: 90%;
    }
  }
  @media only screen and (max-width: 1260px) {
    section {
      width: 75%;
    }
  }
  .icon-big {
		width: 100px;
	}
  .card {
		background-color: hsl(var(--twc-cardBackgroundColor));
		border-radius: 30px;
		padding: 10px 20px;
	}

  #networkDropdown{
    color: hsl(var(--twc-textColor));
    background-color: hsl(var(--twc-cardBackgroundColor));
  }
</style>
