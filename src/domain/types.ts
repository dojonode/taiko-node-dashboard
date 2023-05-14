export interface SysteminformationMetricsInterface {
  memUsedGB: number;
  memUsedPerc: number;
  cpuUsedPerc: number;
  filestorageFreeGB: number;
  filestorageUsedGB: number;
  filestorageUsedPerc: number;
  runtime: number;
  runtimeMetricType: any;
}
// TODO: strip this interface to the necesary items?
export interface Systeminfo {
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
