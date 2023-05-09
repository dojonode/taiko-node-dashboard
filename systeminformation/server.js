const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const app = express();
const port = 3009;

app.use(cors({
    origin: '*'
}));
app.get('/metrics', async (req, res) => {
    const mem = await si.mem();
    const cpu = await si.currentLoad();
    const disk = await si.fsSize();
    const dockerContainers = await si.dockerContainers();
    console.log(dockerContainers);
    const docker = dockerContainers.find(dc => dc.name === "simple-taiko-node-taiko_client_driver-1");

    // const usedMemoryGB = (mem.total - mem.available) / 1024 / 1024 / 1024;
    // const usedMemoryPercent = ((mem.total - mem.available) / mem.total) * 100;
    // const cpuPercent = cpu.currentLoad;

    // const metrics = [
    //     `# HELP memory_used_gb Memory used in gigabytes`,
    //     `# TYPE memory_used_gb gauge`,
    //     `memory_used_gb ${usedMemoryGB.toFixed(2)}`,
    //     `# HELP memory_used_percent Memory used in percentage`,
    //     `# TYPE memory_used_percent gauge`,
    //     `memory_used_percent ${usedMemoryPercent.toFixed(2)}`,
    //     `# HELP cpu_used_percent CPU used in percentage`,
    //     `# TYPE cpu_used_percent gauge`,
    //     `cpu_used_percent ${cpuPercent.toFixed(2)}`
    // ];
    // res.send(metrics.join('\n'));

    const metrics = {
        // memUsedGB: usedMemoryGB.toFixed(2),
        // memUsedPerc: usedMemoryPercent.toFixed(2),
        // cpuUsedPerc: cpuPercent.toFixed(2),
        mem,
        cpu,
        disk,
        dockerContainers
    };

    res.json(metrics);

});
app.get('/metrics2', async (req, res) => {
    // const test = await si.dockerAll();
    const test = await si.dockerAll();

    // const usedMemoryGB = (mem.total - mem.available) / 1024 / 1024 / 1024;
    // const usedMemoryPercent = ((mem.total - mem.available) / mem.total) * 100;
    // const cpuPercent = cpu.currentLoad;


    const metrics = {
        // memUsedGB: usedMemoryGB.toFixed(2),
        // memUsedPerc: usedMemoryPercent.toFixed(2),
        // cpuUsedPerc: cpuPercent.toFixed(2),
        test
    };

    res.json(metrics);

});

app.listen(port, () => {
    console.log(`Metrics API listening at http://localhost:${port}/metrics`);
});