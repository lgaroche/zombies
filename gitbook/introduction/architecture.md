# Architecture

The TZombies dApp has two main components:

* On-chain contracts: a contract that manages the NFT properties, minting, ownership, transfer rules, and another that implements a simple marketplace
* User interface: a webapp where users can interact with the on-chain contracts

It is important to note that in decentralised applications, on-chain contracts contain the core logic and data of the contracts. These contracts must be seen as the ultimate source of truth for the dApp. All other components (front-end, indexers) are peripheral services. As the developer of our application, we provide these as services to enable or enhance the user experience. We must also keep in mind that other parties could build a front end to access our smart contracts, and we cannot assume these parties are trustworthy.&#x20;

This tutorial will not cover building an indexing service for this dApp, but will indicate where indexing would be worthwhile.

## Contracts

Our dApp will use three contracts:

* A multi-asset contract, following the FA2 standard, for tracking ownership of brainz and zombies NFTs
* A marketplace contract, to enable the buying and selling of NFTs
* A permits contract, that stores and verifies transfer permissions (enabling [tzip-17 gasless transfers](https://medium.com/tqtezos/tzip-17-permit-497afd9b0e9e)).

### The FA2 Standard

The FA2 (Financial Asset v2), also known as the [multi-asset standard (tzip-12)](https://tzip.tezosagora.org/proposal/tzip-12/) is a token standard for smart contracts on the Tezos blockchain. It supports three types of token assets:

* Fungible tokens (FT) - Used as currency tokens. Each token id has a finite supply.&#x20;
* Non-fungible tokens (NFT) - The prototypical NFT. Each token id exists as a single instance.&#x20;
* Multi-asset - A mix of the above. Sometimes known as "Semi-fungible" tokens (SFT), or "Fungible NFT", because they share features of both NFTs and FTs. They are fungible within their specific class or category,  but non-fungible when compared to token from other classes.&#x20;

{% hint style="info" %}
The relationship between FTs, NFTs, SFTs and the FA2 token standard can be confusing. \
Here's another way of thinking about it:&#x20;

* The FA2 token standard is an over-arching framework. All the aforementioned token types can be represented on a contract following the FA2 multi-asset standard.
* An NFT is a special case. A multi-asset contract where each unique token id represented has a supply of 1 is a NFT contract. Each token represented is truly non fungible. **Example use case:** A 1/1 digital artwork.&#x20;
* A FT is a special case. A multi-asset contract with only a single token id represented (often `id=0)`and a supply of more than 1 is an FT contract. **Example use case:** an in-world currency for a web3 game.
* A multi-asset or SFT is a more general case. A multi-asset contract representing one or multiple token ids, each with varying supply, would be considered a typical multi-asset.  **Example use case:** Event ticketing. All the 'standing room' tickets at an event are equivalent, and so could be represented by a fungible token in the contract. However, tickets for numbered seats (handled by the same contract) will not be interchangeable. Further, imagine each attendee, regardless of seating, is issued a single digital drink voucher. These would also be fungible, but independent of the other tickets. Thus we have a single contract with multiple tokens, some with NFT type characteristics, and others with FT characteristics. &#x20;

We will employ the multi-asset standard in the TZombies dApp. Mastering the multi-asset token will enable all other use-cases.
{% endhint %}

As the FA2 is a standard that defines a common interface, there exist a default implementation in all the smart contract languages available on Tezos. We will start with the default archetype implementation and augment it to suit our needs.

The default FA2 contract comes with a `permits` contract which provides an important utility - it allows owners to grant permission to marketplaces to handle the sale of their tokens. We will deploy this default contract as-is.
