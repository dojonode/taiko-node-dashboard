const express = require('express');
const si = require('systeminformation');
const cors = require('cors');
const app = express();
const port = 3009;

// Start new timer on startup, to keep track of runtime
const startTime = Math.floor(new Date() / 1000);

app.use(cors({
  origin: '*'
}));
app.get('/metrics', async (req, res) => {
  const mem = await si.mem();
  const cpu = await si.currentLoad();
  const disk = await si.fsSize();

  // const dockerContainers = await si.dockerContainers();
  // const docker = dockerContainers.find(dc => dc.name === "simple-taiko-node-taiko_client_driver-1");

  const metrics = {
    mem,
    cpu,
    disk,
    startTime
  };

  res.json(metrics);

});

app.listen(port, () => {
  console.log(`Metrics API listening at http://localhost:${port}/metrics`);
});
