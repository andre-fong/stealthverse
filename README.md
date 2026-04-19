# StealthVerse

Our dApp implementation of [ERC-5564: Stealth Addresses](https://eips.ethereum.org/EIPS/eip-5564).

Created with ❤️ by [Andre](https://github.com/andre-fong), [Arwin](https://github.com/arwinfong), and [Eddy](https://github.com/Debaoss).

## Table of Contents

- [Deployment Links](#deployment-links)
- [Presentation Link](#presentation-link)
- [Preview](#preview)
- [Running dApp Locally](#running-dapp-locally)
- [Deploying smart contract on a Local Development Chain](#deploying-smart-contract-on-a-local-development-chain)
- [Deploying smart contract on a Testnet Chain (e.g Sepolia)](#deploying-smart-contract-on-a-testnet-chain-eg-sepolia)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Deploy the Contract](#deploy-the-contract)
  - [(Optional) Verify the Contract on Etherscan](#optional-verify-the-contract-on-etherscan)

## Deployment Links

You can find our **deployed dApp here**:

https://stealth-verse.vercel.app/.

> [!NOTE]
> Our app requires the [Metamask browser extension](https://metamask.io/) (and some knowledge of Ethereum) to use!

Find our supplementary `SendAndAnnounce` smart contract deployed on the Sepolia chain here: [0xFA77444e2fB7ED0dd8554f3002bA4f5bB6335CbC](https://sepolia.etherscan.io/address/0xFA77444e2fB7ED0dd8554f3002bA4f5bB6335CbC).

## Presentation Link

Our presentation covering Stealth Addresses is in the root directory of this repository, titled "CSCD21-ERC5564.pdf".

## Preview

![Main page](/preview/main.png)

![Balance page](/preview/balance.png)

![Transfer page](/preview/transfer.png)

## Running dApp Locally

1. Navigate to the `frontend` directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm i
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploying smart contract on a Local Development Chain

1. Install dependencies

```bash
npm install
```

2. Compile the Solidity contracts

```bash
forge build
```

3. Start the local chain using `anvil` (in a separate terminal)

```bash
anvil
```

4. Run the unit tests

```bash
npm test
```

For educational purposes, I wrote these tests in JavaScript using the Ethereum library [`viem`](https://viem.sh/) and the test framework [vitest](https://vitest.dev/).

FYI, the _Foundry_ framework has a different approach to writing unit tests using Solidity directly.

## Deploying smart contract on a Testnet Chain (e.g _Sepolia_)

### Prerequisites

To deploy your app, you need two things:

- A private key account with some Sepolia ETH. There are different wallets for Ethereum; we are going to use [MetaMask](https://metamask.io/) here.
- An RPC endpoint for sending queries and transactions to the Ethereum Sepolia network. There are several Ethereum RPC providers such as [Alchemy](https://www.alchemy.com/) (our choice here) and [Infura](https://www.infura.io/).

1. Install MetaMask, create a wallet, and [export your private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key).

2. Provision your account with Sepolia ETH. To get those ETH, you can use a faucet such as [Google Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) or [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/).

3. Create an account on [Alchemy](https://www.alchemy.com/), then create and export an API key for Sepolia.

### Setup

1. Create an `.env` file and set `ALCHEMY_API_KEY`:

```
ALCHEMY_API_KEY=
ALCHEMY_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}
```

2. Load this `.env` file:

```bash
source .env
```

3. Verify that your RPC endpoint works. This command should show the Sepolia chain ID `11155111`:

```bash
cast chain-id --rpc-url $ALCHEMY_RPC_URL
```

4. Record your key inside the Foundry keystore (use a strong password):

```bash
cast wallet import deployer --private-key your_private_key
```

5. Check your balance on Sepolia and make sure that you have at least 0.01 ETH on your account:

```
cast balance \
  --rpc-url $ALCHEMY_RPC_URL \
  --ether $(cast wallet address --account deployer)
```

### Deploy the Contract

```bash
forge create contracts/SendAndAnnounce.sol:SendAndAnnounce \
  --rpc-url $ALCHEMY_RPC_URL \
  --account deployer \
  --broadcast
```

This should give the following output:

```bash
Deployer: <ACCOUNT_ADDRESS>
Deployed to: <DEPLOYED_ADDRESS>
Transaction hash: <TX_HASH>
```

Your contract has been deployed to `<DEPLOYED_ADDRESS>` and `<TX_HASH>` contains the transaction that includes the deployment.

You can look at this contract on Etherscan:

```
https://sepolia.etherscan.io/address/<DEPLOYED_ADDRESS>
```

And the transaction hash:

```
https://sepolia.etherscan.io/tx/<TX_HASH>
```

Edit the file `static/config.json` and update the contract's address and transaction hash for the Sepolia chain (`11155111`):

```
{
    "11155111": {
        "address": "<DEPLOYED_ADDRESS>",
        "hash": "<TX_HASH>"
    }
}
```

### (Optional) Verify the Contract on Etherscan

Verifying a smart contract on Etherscan makes its source code publicly readable and provably matches the deployed bytecode, building trust and transparency. It allows users, auditors, and integrators to understand exactly what the contract does; reducing the risk of hidden logic, backdoors, or malicious behavior.

```bash
forge verify-contract \
  --chain sepolia \
  --etherscan-api-key "$ETHERSCAN_API_KEY" \
  <DEPLOYED_ADDRESS> \
  contracts/AuctionHouse.sol:AuctionHouse
```

[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/UJQa-DKG)
