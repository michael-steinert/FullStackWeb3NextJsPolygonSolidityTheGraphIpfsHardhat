# Full Stack Web3 App with Next.js, Polygon, Solidity, The Graph, IPFS, and Hardhat

## Technology Stack

* Blockchain - Polygon (with optional RPC Provider)
* Ethereum Development Environment - Hardhat
* Front End Framework - Next.js & React
* Ethereum Web Client Library - Ethers.js
* File Storage - IPFS
* Indexing and Querying - The Graph Protocol

## Basic Hardhat Commands

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/deploy.js
npx hardhat help
```

## Commands

* Deploy Smart Contract to Polygon Testnet:
* `npx hardhat run scripts/deploy.js --network mumbai`

* Initialize TheGraph Project for given Smart Contract Address:
* `graph init --from-contract 0x97F5Ab844C0eAfa22eEF85480Bf9f5BfD70deaE7 --network mumbai --contract-name Blog --index-events`
* Parameters:
  * Protocol: ethereum
  * Product for which to initialize: hosted-service
  * Subgraph name: michael-steinert/blog
  * Directory to create the subgraph in: blog-subgraph
  * Ethereum network: mumbai
  * Contract address: 0x97F5Ab844C0eAfa22eEF85480Bf9f5BfD70deaE7
  * ABI file (path): artifacts/contracts/Blog.sol/Blog.json
  * Contract Name: Blog

### TheGraph

* `--index-events` will automatically populate Code in `schema.graphql` as well as `src/mapping.ts` based on the Events emitted from the Smart Contract
* `subgraph.yaml` a YAML File containing the Subgraph Manifest
* `schema.graphql` a GraphQL Schema that defines what Data is stored for the Subgraph, and how to query it via GraphQL
* `AssemblyScript Mappings` are AssemblyScript Code that translates from the Event Data in Ethereum to the Entities defined in the Schema in the `mapping.ts`

### Subgraph Manifest (subgraph.yaml)

* `description (optional)` a Human-readable Description of what the Subgraph is. This Description is displayed by TheGraph Explorer when the Subgraph is deployed to the Hosted Service
* `repository (optional)` the URL of the Repository where the Subgraph Manifest can be found. This is also displayed by TheGraph Explorer 
* `dataSources.source` the Address of the Smart Contract the Subgraph Sources, and the ABI of the Smart Contract to use. The Address is optional; omitting it allows indexing matching Events from all Smart Contracts
* `dataSources.source.startBlock (optional)` the Number of the Block that the Data Source starts Indexing from. In most Cases it is suggested to use the Block in which the Smart Contract was created
* `dataSources.mapping.entities` the Entities that the Data Source writes to the Store. The Schema for each Entity is defined in the `schema.graphql` File
* `dataSources.mapping.abis` one or more named ABI Files for the Source Smart Contract as well as any other Smart Contracts to interact with from within the Mappings
* `dataSources.mapping.eventHandlers` lists the Smart Contract Events this Subgraph reacts to and the Handlers in the Mapping `./src/mapping.ts` that transform these Events into Entities in the Store
