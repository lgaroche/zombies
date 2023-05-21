import { ReactNode, createContext, useCallback, useContext } from "react"
import WertWidget from "@wert-io/widget-initializer"
import { signSmartContractData } from "@wert-io/widget-sc-signer"
import { useTzombiesContext } from "./TzombiesProvider"
import { useWalletContext } from "./WalletProvider"
import { useMetadataContext } from "./MetadataProvider"

interface WertProviderContextProps {
  checkout: (id: number) => Promise<void>
}

const WertProviderContext = createContext<WertProviderContextProps>({
  checkout: async () => {},
})

const useWertProviderContext = () => useContext(WertProviderContext)

const WertProvider = ({ children }: { children: ReactNode }) => {
  const { tokenInfo, fa2 } = useTzombiesContext()
  const { ipfsUriToGateway } = useMetadataContext()
  const { Tezos, account } = useWalletContext()

  const checkout = useCallback(
    async (id: number) => {
      if (!Tezos || !fa2 || !fa2.address || !account) return

      const contract = await Tezos.contract.at(fa2.address)
      const txParams = contract.methods
        .mint(id, account.address)
        .toTransferParams({ amount: 1 })
      const michelson = JSON.stringify(txParams?.parameter)
      console.log(michelson)
      const sc_input_data = "0x" + Buffer.from(michelson).toString("hex")
      console.log(sc_input_data)

      const signedData = signSmartContractData(
        {
          address: account.address,
          commodity: "XTZ",
          commodity_amount: 2,
          sc_address: fa2.address,
          sc_input_data,
          network: "ghostnet",
        },
        "0x57466afb5491ee372b3b30d82ef7e7a0583c9e36aef0f02435bd164fe172b1d3"
      )
      const options = {
        partner_id: "01H0SP3RFRFZPH7H4NAJM4HZ39",
        origin: "https://sandbox.wert.io",
        theme: "dark",
        container_id: "wert-module",
        extra: {
          item_info: {
            author_image_url: "",
            author: "TZombies",
            image_url: ipfsUriToGateway(tokenInfo.get(id)?.displayUri ?? ""),
            seller: "TZombies",
          },
        },
      }
      const wertWidget = new WertWidget({
        ...signedData,
        ...options,
      })

      wertWidget.mount()
    },
    [Tezos, account, fa2, ipfsUriToGateway, tokenInfo]
  )

  return (
    <WertProviderContext.Provider value={{ checkout }}>
      {children}
    </WertProviderContext.Provider>
  )
}

export { WertProvider, useWertProviderContext }
