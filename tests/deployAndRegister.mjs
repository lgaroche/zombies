import {
  deploy,
  getAccount,
  setEndpoint,
  setQuiet,
} from "@completium/completium-cli"

setQuiet(true)
//setEndpoint("mockup")

let permits, market, fa2

const alice = getAccount("alice")

describe("Contracts deployment", async () => {
  it("permits", async () => {
    ;[permits] = await deploy("./contracts/permits.arl", {
      parameters: {
        owner: alice.pkh,
      },
      named: "permits",
      as: "alice",
    })
  })

  it("market", async () => {
    ;[market] = await deploy("./contracts/market.arl")
  })

  it("fa2", async () => {
    ;[fa2] = await deploy("./contracts/fa2.arl", {
      parameters: {
        owner: alice.pkh,
        permits: permits.address,
      },
      named: "fa2",
      as: "alice",
    })
  })
})

describe("Register NFTs", async () => {
  it("register zombie", async () => {
    await fa2.set_token_metadata({
      arg: {
        tid: 1,
        tdata: [
          {
            key: "",
            value:
              "0x697066733a2f2f516d53445733794257756e7977624c544c78723835784843464d6d747a5372365a55565138433375346161314d65",
          },
        ],
      },
    })
  })
  it("register brainz", async () => {
    await fa2.set_token_metadata({
      arg: {
        tid: 2,
        tdata: [
          {
            key: "",
            value:
              "0x697066733a2f2f516d546d65517a55754b37716d467337795466563254434c5a416852466d716d714a793536636b6b7a666a586939",
          },
        ],
      },
    })
  })
  it("get config", async () => {
    console.log("market", market.address)
    console.log("fa2", fa2.address)
    console.log("permits", permits.address)
  })
})
