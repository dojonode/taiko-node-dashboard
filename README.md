# Taiko Node Status

Taiko node status is a dashboard that provides quick and digestible insights into your Taiko node.

## Usage

To run the dashboard, simply follow these steps:

1. `git clone https://github.com/wolfderechter/taiko-node-status.git`
2. `cd taiko-node-status`
3. `cp .env.sample .env` or `copy .env.sample .env`
4. Place the private key used for the proposer/prover in the .env file variable `VITE_PRIVATE_KEY`
5. Make sure docker desktop is running
6. Start the simple-taiko-node
7. `docker compose up`
8. visit localhost:8082

## Development

<details>
<summary>Development steps</summary>

### Pre-installation

Make sure you have **node** and **npm** installed on your system. You can do it by:

`brew install node`
`brew install npm`

### Installation

To use the [taiko-node-status](https://github.com/wolfderechter/taiko-node-status) you need to install **pnpm**:

`pnpm install`

### Development Usage

You can start the application with the following code:

`pnpm start`

</details>
