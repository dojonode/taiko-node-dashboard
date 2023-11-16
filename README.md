# Taiko Node Dashboard
![Docker Pulls](https://img.shields.io/docker/pulls/wolfderechter/taiko-node-dashboard)

Taiko node dashboard is aimed to provide quick and digestible insights into your Taiko node.
![Cover_Image](https://github.com/dojonode/taiko-node-dashboard/assets/60930264/8a18073f-848c-421f-9e81-4aae5482737e)

## Usage

To run the dashboard simply append the following two services to the `docker-compose.yml` of the taiko node.

```docker-compose
  taiko-node-dashboard:
     image: wolfderechter/taiko-node-dashboard:latest
     ports:
       - "7744:80"
  taiko-node-systeminfo:
     image: wolfderechter/taiko-node-systeminfo:latest
     ports:
       - "3009:3009"
```

Or if you wish to run the dashboard standalone:

1. `git clone https://github.com/dojonode/taiko-node-dashboard-docker`
2. `cd taiko-node-dashboard-docker`
3. `docker compose up`
4. visit http://localhost:7744 to access the dashboard
5. Click on the 📡 button and change localhost to the IP address of the node's machine


## Development

<details>
<summary>Development steps</summary>

### Pre-installation

Make sure you have **node** and **npm** installed on your system. You can do it by:

`brew install node`
`brew install npm`
`npm install -g pnpm`

### Development Usage

You can start the application with the following lines:

`pnpm install`

`pnpm start`

You'll probably also want to start the [systeminformation](https://github.com/dojonode/dojonode-systeminformation) application with:

`git clone https://github.com/dojonode/dojonode-systeminformation`

`cd dojonode-systeminformation`

`node server.js`

### Deployment

To deploy to the website run: `pnpm run predeploy` and `pnpm run deploy`. This will build the website and push to the `gh-pages` branch.

</details>
