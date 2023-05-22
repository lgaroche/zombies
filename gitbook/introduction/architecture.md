# Architecture

As mentioned in the previous section, the app has two main components:&#x20;

* Two on-chain contracts, one that manages the NFT properties, minting, ownership, transfer rules, and the other that implements a simple marketplace
* The front-end dApp, that allows users to interact with the on-chain contracts

It is important to note that in decentralised applications, the on-chain contains the reference core logic of the application. It must be seen a the only source of truth. All other components (front-end, indexers) are optional, could be externally owned, and should be treated with limited trust assumptions. As the developer of our application, we provide these as services, to enable or enhance the user experience.&#x20;

For the sake of learning, we will not integrate any indexing service in this dApp, at the cost of unoptimised interactions. Parts that would benefit from external indexing will be pointed out during the tutorial.&#x20;

## Contracts

Two contracts will be developed.

### FA2

The FA2 (Financial Asset v2), also known as the [multi-asset standard (tzip-12)](https://tzip.tezosagora.org/proposal/tzip-12/) is a token standard on the Tezos blockchain. It supports three types of token assets:

* Fungible tokens (FT) - Used as currency tokens. Each token id has a finite supply.
* Non-fungible tokens - The NFT gold standard. Each token id exists as a single instance.
* Multi-asset - A mix of the above. Also known as "Semi-fungible" tokens, or "Fungible NFT", because they are actually fungible. Usually the difference is in the usage, as they are more commonly used as collectibles, where the supply is limited (now, define _limited_) and have media attached to it.&#x20;

Seen differently: the multi-asset is the general case, NFT is a multi-asset where each token id has a supply of 1, and FT is a multi-asset where there is only one token id per contract (0).

In this tutorial we will use the multi-asset standard, as mastering it will enable all other use-cases.

As the FA2 is a standard that defines a common interface, there exist default implementation in all the smart contract languages available on Tezos. We will use this default implementation, on top of which we'll add our custom code.

### Market

To dig a bit deeper into Smart Contract interaction, we will write a simple marketplace contract, that allows token owners to list their NFTs for sale.&#x20;
