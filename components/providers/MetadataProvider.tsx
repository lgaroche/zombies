import React, { createContext, useCallback, useContext } from "react"

interface ZombieMetadata {
  name: string
  description?: string
  displayUri: string
  thumbnailUri: string
  attributes: {
    alive: boolean
  }
}

interface MetadataProviderContextProps {
  fetchMetadata: (tokenInfo: string) => Promise<ZombieMetadata>
  ipfsUriToGateway: (ipfsUri: string) => string
}

const ipfsUriToGateway = (ipfsUri: string) =>
  ipfsUri.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")

const MetadataContext = createContext<MetadataProviderContextProps>({
  fetchMetadata: function (tokenInfo: string): Promise<ZombieMetadata> {
    throw new Error("Function not implemented.")
  },
  ipfsUriToGateway,
})

const useMetadataContext = () => useContext(MetadataContext)

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
