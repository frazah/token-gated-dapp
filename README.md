# Token-Gated Content DApp

A local Ethereum demo in which holding a membership NFT unlocks a gallery in the browser. An administrator issues NFTs and adds content URLs; users connect MetaMask, and the app checks their NFT balance before loading the gallery.

The project demonstrates how two smart contracts separate membership management from content access. It has a static frontend and no application backend or user database. Ganache provides the local blockchain, while images are fetched from external hosts.

## How the project works

Membership follows a simple rule:

```text
Membership.balanceOf(user) > 0 → user is a member
```

There are no subscriptions, expiration dates, or membership tiers. One NFT is enough, and holding more NFTs does not grant additional permissions. Membership NFTs support standard ERC721 transfers: transferring the last NFT away removes the sender's eligibility and gives the recipient eligibility. The interface reflects the current balance when it reloads data.

```text
Browser frontend ←→ MetaMask / Ethereum provider ←→ Ganache
                                                     │
                                                     ├─ Membership: NFT balances and minting
                                                     └─ ContentGate: content URLs
                                                          └─ checks Membership.balanceOf(caller)

Browser frontend ── fetches images ──→ external image hosts / IPFS gateway
```

### Membership contract

[`contracts/Membership.sol`](contracts/Membership.sol) extends OpenZeppelin's `ERC721` and `Ownable`. It creates the **MembershipCard** collection with symbol **MBR**.

- The deployer initially owns the contract.
- Only the owner can call `mint(to)` to issue an NFT to an address.
- Token IDs increase sequentially, starting at `0`.
- Minting uses `_safeMint`, which also checks that contract recipients support receiving ERC721 tokens.
- Standard ERC721 functions, including `balanceOf`, approvals, and transfers, are inherited. There is no public purchase function or custom membership revocation function.

### Content gate contract

[`contracts/ContentGate.sol`](contracts/ContentGate.sol) receives the membership contract's address at deployment and uses it to check eligibility. It stores an ordered array of strings intended to be content URLs; it does not store image files or validate URL formats.

| Function | Who can call it | Behavior |
| --- | --- | --- |
| `canAccess(user)` | Anyone, for a nonzero user address | Returns whether the address holds at least one membership NFT. |
| `contentsCount()` | Anyone | Returns the number of stored entries. |
| `getContent(index)` | A caller holding a membership NFT | Returns one entry; reverts if the caller is not a member or the index is out of bounds. |
| `getContents()` | A caller holding a membership NFT | Returns the full array. The frontend reads entries individually instead. |
| `addContent(url)` | The content gate owner | Appends an entry. Existing entries cannot be edited or deleted through this contract. |

Both content getters check `canAccess(msg.sender)`, so the caller address matters. Being the contract owner does not bypass this check: an administrator also needs an NFT to read the gallery through these functions.

Each contract has its own owner. Deployment assigns both to the same account, but ownership can be transferred independently through inherited `Ownable` functions. The frontend assumes the owners are the same: it shows the entire admin panel based on `Membership.owner()`. If ownership diverges, the contracts still enforce their own permissions, but the panel may show controls the connected account cannot use.

### Frontend flow

[`frontend/index.html`](frontend/index.html) contains all HTML, CSS, and browser JavaScript. It uses Ethers.js **5.7.2**, imported from a CDN, and loads contract addresses and ABIs from the generated `frontend/contractInfo.js`. An ABI describes the contract functions Ethers can call.

1. **Connect the wallet.** The connect button requests account access through MetaMask. On page load, the app also checks for accounts that have already been authorized.
2. **Determine the user's role.** The app reads the selected address, calls `Membership.balanceOf(address)`, and displays the membership status. It compares that address with `Membership.owner()` to decide whether to show the admin panel.
3. **Load the gallery.** For a member, the app connects `ContentGate` to the wallet's signer, reads `contentsCount()`, and calls `getContent(index)` for each entry. Connecting the signer supplies the caller address used by the contract's membership check.
4. **Render images.** Each URL becomes an image card. An `ipfs://` URI is converted to an HTTPS URL using the Pinata gateway hardcoded in `resolveIPFS()`. Although the contract accepts arbitrary strings, the gallery renders every entry as an image.
5. **Perform admin actions.** The administrator can mint an NFT to a recipient or append a content URL. Each action sends a transaction, requires wallet confirmation, and waits for a mined receipt. Adding content then refreshes the gallery; minting only updates the transaction status.

Reading balances and content uses RPC calls without sending a transaction or paying gas. Minting and adding content change blockchain state and consume gas, paid with local test ETH.

The app renders on page load, after connecting, and after adding content. It does not subscribe to account changes, network changes, or NFT transfers. Reload the page after switching accounts or networks, or after a membership balance changes.

### What access control means here

The contract enforces membership checks when its content getters execute, and the frontend hides the gallery for nonmembers. **This does not make the stored URLs or linked images confidential.**

The array is marked `private` in Solidity, but blockchain storage and transaction inputs remain publicly readable. Also, read calls use `eth_call`: a caller can supply a member address as the `from` field without proving control of its private key. A public image URL can be opened directly once known, and transferring an NFT cannot revoke a URL someone has already copied.

This is a demonstration of membership checks and wallet-driven UI access. Confidential delivery would require an additional mechanism, such as encrypted content or a service that verifies wallet signatures before serving protected files.

## Repository and deployment

| File | Purpose |
| --- | --- |
| `contracts/Membership.sol` | Defines the membership NFT and owner-only minting. |
| `contracts/ContentGate.sol` | Stores content URLs and checks NFT ownership in its getters. |
| `scripts/deploy.js` | Deploys both contracts, seeds demo data, and exports frontend configuration. |
| `hardhat.config.js` | Selects Solidity `0.8.24` and configures the local RPC endpoint and chain ID. |
| `frontend/index.html` | Implements wallet connection, role checks, the gallery, and admin controls. |
| `frontend/contractInfo.js` | Generated by deployment; contains both contracts' addresses and ABIs. |
| `package.json` | Declares dependencies and the `start-chain` command. |

The contracts use OpenZeppelin **4.9.x**, and Hardhat **2.x** with Hardhat Toolbox handles compilation and deployment. The deployment script uses the Ethers API provided by Toolbox, including `waitForDeployment()`; the browser uses the separate Ethers 5 API described above.

Running `scripts/deploy.js` performs these steps:

1. Deploys `Membership`, then deploys `ContentGate` with the membership address.
2. Mints one NFT to the deployer and one to the second local account.
3. Adds two sample image URLs to `ContentGate`.
4. Writes both contract addresses and their compiled ABIs to `frontend/contractInfo.js`, replacing any previous configuration.

The resulting demo accounts are:

| Ganache account | Initial role | Expected behavior |
| --- | --- | --- |
| `(0)` | Owner of both contracts and NFT holder | Sees the gallery and admin controls. |
| `(1)` | NFT holder | Sees the gallery without admin controls. |
| `(2)` | Nonmember | Sees the nonmember message and no gallery. |

The UI suggests buying an NFT, but no purchase flow is implemented. To grant access in this demo, the administrator mints an NFT to the user's address, or an existing holder transfers one using ERC721 tools outside this interface.

## Local setup

### Prerequisites

- Node.js and npm compatible with the project's Hardhat 2 / Toolbox dependencies.
- MetaMask installed in your browser.
- Python 3 for the static file server shown below.
- Internet access for the browser's Ethers CDN import, fonts, and externally hosted images.

### 1. Install dependencies and start Ganache

From the repository root:

```bash
npm install
npm run start-chain
```

Ganache is a project dependency; a global installation is unnecessary. Leave this terminal running. The script starts the RPC server on port `8545` with a fixed test mnemonic. Use these accounts only for local development; their keys are publicly known.

### 2. Deploy and initialize the demo

In a second terminal, from the repository root:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Hardhat compiles the contracts and runs the deployment and initialization steps described above, including generating `frontend/contractInfo.js`.

### 3. Configure MetaMask

Add and select this custom network:

| Setting | Value |
| --- | --- |
| Network name | Local Ganache |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `1337` |
| Currency symbol | `ETH` |

Import Ganache accounts `(0)`, `(1)`, and `(2)` using the private keys printed in its terminal to try the administrator, member, and nonmember roles.

### 4. Serve and try the app

In another terminal, from the repository root:

```bash
python3 -m http.server 8000 --directory frontend
```

Open [http://localhost:8000](http://localhost:8000), select a test account in MetaMask, and click **Connetti Wallet** (Connect Wallet). The interface labels are currently in Italian.

- With account `(0)`, verify that the gallery and admin panel appear. Mint an NFT to account `(2)` or add an image URL, confirming the transaction in MetaMask.
- With account `(1)`, verify that the gallery appears without admin controls.
- With account `(2)`, verify that the gallery is hidden before receiving an NFT and visible afterward. Reload after each account switch or balance change.

If contract calls fail, check that Ganache is running, MetaMask uses chain `1337`, and deployment has generated `frontend/contractInfo.js` for the current chain. Restarting Ganache without persistence resets its state; run deployment again and reload the page. For IPFS images, availability also depends on the configured gateway.

There is currently no automated test suite: `npm test` is a placeholder that exits with an error. The account-based walkthrough above provides a manual check of the main demo flows.
