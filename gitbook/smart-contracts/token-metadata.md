---
description: The link between on-chain and off-chain data
---

# Token metadata

Smart contracts need only store the minimum amount of data to identify the owner of a token. "External" properties are typically stored off-chain.&#x20;

Sometimes these data are stored on regular cloud services. However, for better coherence and decentralisation, many projects store the token metadata on a decentralised service called [IPFS](https://ipfs.io). Other decentralised storage solutions include Filecoin and Arweave.

IPFS works with content-addressable URI, which means that the URI of an object is the signature (hash) of its content. This allows us to create a strong link between the on-chain information and the off-chain metadata. **tzip-12** and **tzip-21** allow this by adding a `token_metadata` map, where the empty string key will point to a byte-encoded string representing the metadata URI (see the [doc](https://tzip.tezosagora.org/proposal/tzip-12/#token-metadata) for more details)

The steps to publish metadata on IPFS are as follows

## Prepare the content

A NFT usually has a media representation (image, video...). We'll use a simple PNG image here, one of a zombie, the other of a brain. Don't ask me why.

The media file can be published on IPFS, which means made available on at least a node on the network. To achieve this, either you can have an IPFS node running, or you can use pinning services such as:

* [Aleph.im](https://account.aleph.im)
* [Pinata](https://www.pinata.cloud/)

When the file will be published, you will get a content identifier (CID) in return. This is used to construct the URI to access the content.&#x20;

We'll use the following two images for our dApp:

* [ipfs://QmT2NbKvqrXTwZQXcziP3XiTawk63eWknYsGegBAGDKRAJ](ipfs://QmT2NbKvqrXTwZQXcziP3XiTawk63eWknYsGegBAGDKRAJ)
* [ipfs://QmehW5o2t2ZGUoHBYqdFbozGEWSSGrNBtcPcocaLXPpxbY](ipfs://QmehW5o2t2ZGUoHBYqdFbozGEWSSGrNBtcPcocaLXPpxbY)

If your browser cannot open these links, replace `ipfs://` with `https://ipfs.io/ipfs/` to use a gateway.&#x20;

### JSON

Now that we have our images, we can prepare the rest of the metadata. Following the token metadata standard, we end up with the following format:&#x20;

```json
{
  "name": "Brainz",
  "description": "A tasty brainz",
  "artifactUri": "ipfs://QmT2NbKvqrXTwZQXcziP3XiTawk63eWknYsGegBAGDKRAJ",
  "displayUri": "ipfs://QmT2NbKvqrXTwZQXcziP3XiTawk63eWknYsGegBAGDKRAJ",
  "thumbnailUri": "ipfs://QmT2NbKvqrXTwZQXcziP3XiTawk63eWknYsGegBAGDKRAJ",
  "symbol": "",
  "tags": ["tezos", "tutorial"],
  "creators": [],
  "formats": [
    {
      "uri": "ipfs://QmT2NbKvqrXTwZQXcziP3XiTawk63eWknYsGegBAGDKRAJ",
      "mimeType": "image/png"
    }
  ],
  "decimals": 0,
  "isBooleanAmount": false,
  "shouldPreferSymbol": false,
  "attributes": [
    {
      "name": "Alive",
      "value": true,
      "type": "boolean"
    }
  ]
}
```

```json
{
  "name": "TZombie",
  "description": "A deadly undead creature",
  "artifactUri": "ipfs://QmehW5o2t2ZGUoHBYqdFbozGEWSSGrNBtcPcocaLXPpxbY",
  "displayUri": "ipfs://QmehW5o2t2ZGUoHBYqdFbozGEWSSGrNBtcPcocaLXPpxbY",
  "thumbnailUri": "ipfs://QmehW5o2t2ZGUoHBYqdFbozGEWSSGrNBtcPcocaLXPpxbY",
  "symbol": "",
  "tags": ["tezos", "tutorial"],
  "creators": [],
  "formats": [
    {
      "uri": "ipfs://QmehW5o2t2ZGUoHBYqdFbozGEWSSGrNBtcPcocaLXPpxbY",
      "mimeType": "image/png"
    }
  ],
  "decimals": 0,
  "isBooleanAmount": false,
  "shouldPreferSymbol": false,
  "attributes": [
    {
      "name": "Alive",
      "value": false,
      "type": "boolean"
    }
  ]
}
```

These two files are also published to IPFS. We get these two URI for our metadata:&#x20;

* Zombie: [ipfs://QmTmeQzUuK7qmFs7yTfV2TCLZAhRFmqmqJy56ckkzfjXi9](https://gateway.ipfs.io/ipfs/QmTmeQzUuK7qmFs7yTfV2TCLZAhRFmqmqJy56ckkzfjXi9)
* Brainz: [ipfs://QmSDW3yBWunywbLTLxr85xHCFMmtzSr6ZUVQ8C3u4aa1Me](https://gateway.ipfs.io/ipfs/QmSDW3yBWunywbLTLxr85xHCFMmtzSr6ZUVQ8C3u4aa1Me)

### Contract encoding

According to the standard, the two metadata URI must be set as a bytes sequence representing the URI string in the smart contract. This gives us:

* Zombie: `697066733a2f2f516d546d65517a55754b37716d467337795466563254434c5a416852466d716d714a793536636b6b7a666a586939`
* Brainz: `697066733a2f2f516d53445733794257756e7977624c544c78723835784843464d6d747a5372365a55565138433375346161314d65`

{% hint style="info" %}
To generate the byte sequence from a string, we can use this Node.js one-liner:

```javascript
Buffer.from("<your string>").toString('hex')
```
{% endhint %}

These two byte-strings are the values set in the  \`set\_token\_metadata\` contract call, as we saw [earlier](fa2-contract/deploying-and-testing.md#testing).
