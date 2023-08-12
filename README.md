# Taiko Node Dashboard

Taiko node dashboard is aimed to provide quick and digestible insights into your Taiko node.
![Cover_Image](https://github.com/wolfderechter/taiko-node-dashboard/assets/60930264/8a18073f-848c-421f-9e81-4aae5482737e)

## Usage

To run the dashboard, there are 2 recipes posted in the [taiko-node-dashboard-docker](https://github.com/wolfderechter/taiko-node-dashboard-docker) using docker to either run the dashboard standalone or spin up the dashboard alongside a node.

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

You'll probably also want to start the [systeminformation](https://github.com/wolfderechter/dojonode-systeminformation) application with:

`git clone https://github.com/wolfderechter/dojonode-systeminformation`

`cd dojonode-systeminformation`

`node server.js`

</details>
