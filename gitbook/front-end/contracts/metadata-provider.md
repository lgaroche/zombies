# Metadata provider

The smart contract only hold a reference to the token metadata on IPFS. The role of the `MetadataProvider` is to fetch the content from IPFS and translate it to a usable metadata object.&#x20;

Create `./components/providers/MetadataProvider.tsx`

Token metadata follow the [tzip-21 specification](https://tzip.tezosagora.org/proposal/tzip-21/). Let's define a simple subset of the properties:&#x20;

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

As for all our providers, define the context props:&#x20;

```tsx
interface MetadataProviderContextProps {
  fetchMetadata: (tokenInfo: string) => Promise<ZombieMetadata>
  ipfsUriToGateway: (ipfsUri: string) => string
}
```

This is a helper function that we'll reuse a few times, probably there's a better location than this component. It replaces the IPFS URI with a HTTPS gateway, as most browsers still don't support IPFS natively. This is not ideal, since gateways are more centralised.

```tsx
const ipfsUriToGateway = (ipfsUri: string) =>
  ipfsUri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
```

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

And now the provider implementation, it simply uses the Fetch API to retrive a JSON from the gateway and return a `ZombieMetadata` object.&#x20;

It could be interesting (and safe) here to save a cache of the metadata, as an IPFS URI is immutable.

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
