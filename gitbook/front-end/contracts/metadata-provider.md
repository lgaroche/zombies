# Metadata provider

Our smart contract holds a reference to token metadata on IPFS, not the metadata itself. The role of the `MetadataProvider` is to fetch the content from IPFS and translate it to a usable metadata object.

Create `./components/providers/MetadataProvider.tsx` and add the following import statement:

```tsx
import { createContext, useContext, useCallback } from 'react'
```

Token metadata should follow the [tzip-21 specification](https://tzip.tezosagora.org/proposal/tzip-21/). Let's define a subset of the standard properties:&#x20;

```tsx
interface ZombieMetadata {
  name: string
  description?: string
  displayUri: string
  thumbnailUri: string
  attributes: {
    alive: boolean
  }
}
```

We will define a context props interface for every provider. In this case:&#x20;

```tsx
interface MetadataProviderContextProps {
  fetchMetadata: (tokenInfo: string) => Promise<ZombieMetadata>
  ipfsUriToGateway: (ipfsUri: string) => string
}
```

Now we will define a helper function that replaces the IPFS URI with a HTTPS gateway, as most browsers still don't support IPFS natively. This isn't ideal because gateways are more centralised.&#x20;

```tsx
const ipfsUriToGateway = (ipfsUri: string) =>
  ipfsUri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
```

{% hint style="info" %}
We will be using [next/image](https://nextjs.org/docs/pages/api-reference/components/image) components. Since Next 13, the image component allows new customisation and optimisations for a smoother user experience. However, they require us to declare external image sources. Add the following object to `next.config.js`

```javascript
images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
      },
    ],
  },
```
{% endhint %}

As we will reuse the above function a few times, you might prefer to move it into a utilities file rather than importing it's use from this component (as we do in this tutorial)

Create an empty context:

```tsx
const MetadataContext = createContext<MetadataProviderContextProps>({
  fetchMetadata: function (tokenInfo: string): Promise<ZombieMetadata> {
    throw new Error("Function not implemented.")
  },
  ipfsUriToGateway,
})
const useMetadataContext = () => useContext(MetadataContext)
```

And now the provider implementation, it simply uses the Fetch API to retrieve a JSON from the gateway and return a `ZombieMetadata` object.&#x20;

{% hint style="info" %}
It could be interesting here to save a cache of the metadata. It will be safe as well, as an IPFS URI is immutable.
{% endhint %}

```tsx
const MetadataProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchMetadata = useCallback(async (tokenInfo: string) => {
    if (!tokenInfo.startsWith("ipfs://")) {
      throw new Error("Invalid tokenInfo")
    }
    const res = await fetch(ipfsUriToGateway(tokenInfo))
    const metadata = await res.json()
    console.log(metadata)
    return metadata
  }, [])

  return (
    <MetadataContext.Provider value={{ fetchMetadata, ipfsUriToGateway }}>
      {children}
    </MetadataContext.Provider>
  )
}

export { MetadataProvider, useMetadataContext }
export type { ZombieMetadata }

```

Remember to include the Metadata provider in the app hierarchy in `_app.tsx.`
