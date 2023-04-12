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
  import { onMount } from "svelte";
  import { getProofReward } from "../../utils/getProofReward";
  import type { Status, StatusIndicatorProp } from "../../domain/status";
  import { getStateVariables } from "../../utils/getStateVariables";
  import { truncateString } from "../../utils/truncateString";
  import TaikoL1 from "../../constants/abi/TaikoL1";
  import DetailsModal from "../../components/DetailsModal.svelte";
  import { addressSubsection } from "../../utils/addressSubsection";
  import Web3 from "web3";
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

  let peers = 0;
  let blockNumber;
  let syncingStatus;

  // const registry = new Registry();
  // const counter = new Counter({
  //   name: "my_counter",
  //   help: "A simple counter",
  // });
  const myNode = new Web3("http://localhost:8545");
  const taiko = new Web3("https://l2rpc.a2.taiko.xyz");

  async function getSyncingStatus() {
    syncingStatus = await myNode.eth.isSyncing();
    blockNumber = await taiko.eth.getBlockNumber();
    console.log(syncingStatus);
  }
  getSyncingStatus();
  onMount(async () => {
    try {
      let response = await fetch(
        "http://localhost:9090/api/v1/query?query=p2p_peers"
      );
      let data = await response.json();
      let value = data.data.result[1].value[1];
      peers = value;
    } catch (e) {
      console.error(e);
    }
  });
</script>

<div class="text-center">
  <h1 class="text-2xl">Taiko Node Status</h1>
</div>
<div
  class="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center my-10"
>
  {#if peers}
    <p>Peers: {peers}</p>
  {/if}
  {#if blockNumber}
    <p>Total blocks: {blockNumber}</p>
  {/if}
  {#if syncingStatus}
    <p>Node block: {syncingStatus.currentBlock}</p>
    <p>
      Progress: {(syncingStatus.currentBlock / syncingStatus.highestBlock) *
        100}%
    </p>
  {:else}
    <p>Synced!</p>
  {/if}
</div>
