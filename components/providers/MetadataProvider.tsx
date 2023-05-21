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
}

const MetadataProviderContext = createContext<MetadataProviderContextProps>({
  fetchMetadata: function (tokenInfo: string): Promise<ZombieMetadata> {
    throw new Error("Function not implemented.")
  },
})

const useMetadataProviderContext = () => useContext(MetadataProviderContext)

const MetadataProvider = ({ children }: { children: React.ReactNode }) => {
  const fetchMetadata = useCallback(async (tokenInfo: string) => {
    if (!tokenInfo.startsWith("ipfs://")) {
      throw new Error("Invalid tokenInfo")
    }
    const res = await fetch(
      tokenInfo.replace("ipfs://", "https://cloudflare-ipfs.com/ipfs/")
    )
    const metadata = await res.json()
    console.log(metadata)
    return metadata
  }, [])

  return (
    <MetadataProviderContext.Provider value={{ fetchMetadata }}>
      {children}
    </MetadataProviderContext.Provider>
  )
}

export { MetadataProvider, useMetadataProviderContext }
export type { ZombieMetadata }
