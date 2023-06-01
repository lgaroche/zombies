import {
  get_account,
  set_quiet,
  expect_to_fail,
} from "@completium/experiment-ts"
import { Tzombies, add_for_all, ledger_key } from "./bindings/tzombies"
import { Permits } from "./bindings/permits"
import { Market } from "./bindings/market"
import { Nat, Bytes, Tez } from "@completium/archetype-ts-types"

const assert = require("assert")

set_quiet(true)

let permits: Permits = new Permits()
let market: Market = new Market()
let fa2: Tzombies = new Tzombies()

const alice = get_account("alice")
const bob = get_account("bob")

describe("Contracts deployment", async () => {
  it("permits", async () => {
    await permits.deploy(alice.get_address(), { as: alice })
    console.log("permits", permits.address)
  })

  it("market", async () => {
    await market.deploy({ as: alice })
    console.log("market", market.address)
  })

  it("fa2", async () => {
    await fa2.deploy(alice.get_address(), permits.get_address(), { as: alice })
    console.log("fa2", fa2.address)
  })
})

describe("Register NFTs", async () => {
  it("register zombie", async () => {
    await fa2.set_token_metadata(
      new Nat(1),
      [
        [
          "",
          new Bytes(
            "697066733a2f2f516d53445733794257756e7977624c544c78723835784843464d6d747a5372365a55565138433375346161314d65"
          ),
        ],
      ],
      { as: alice }
    )
  })
  it("register brainz", async () => {
    await fa2.set_token_metadata(
      new Nat(2),
      [
        [
          "",
          new Bytes(
            "697066733a2f2f516d546d65517a55754b37716d467337795466563254434c5a416852466d716d714a793536636b6b7a666a586939"
          ),
        ],
      ],
      { as: alice }
    )
  })
})

describe("Mint and trade", async () => {
  it("mint zombie", async () => {
    await fa2.mint(
      alice.get_address(), // tow
      new Nat(1), // tid
      new Nat(1), // nbt
      {
        as: alice,
        amount: new Tez(2),
      }
    )
    // check that Alice now has 1 zombie
    const key = new ledger_key(alice.get_address(), new Nat(1))
    const amount = await fa2.get_ledger_value(key)
    assert(amount?.to_number() === 1)
  })

  it("sell zombie", async () => {
    await market.sell(
      fa2.get_address(),
      new Nat(1), // token_id_
      new Nat(1), // amount_
      new Tez(5), // price_
      new Date("2023-12-01T00:00:00Z"), // expiry_
      {
        as: alice,
      }
    )
  })

  it("buy zombie before operator update should fail", async () => {
    await expect_to_fail(async () => {
      await market.buy(new Nat(1), new Nat(1), { amount: new Tez(5), as: bob })
    }, permits.errors.INVALID_CALLER)

    // check that Alice still has 1 zombie
    const key = new ledger_key(alice.get_address(), new Nat(1))
    const amount = await fa2.get_ledger_value(key)
    assert(amount?.to_number() === 1)
  })

  it("approve marketplace", async () => {
    const arg = new add_for_all(market.get_address())
    await fa2.update_operators_for_all([arg], { as: alice })
  })

  it("buy zombie without enough tez should fail", async () => {
    await expect_to_fail(async () => {
      await market.buy(new Nat(1), new Nat(1), { amount: new Tez(1), as: bob })
    }, market.errors.r_value)

    // check that Alice still has 1 zombie
    const key = new ledger_key(alice.get_address(), new Nat(1))
    const amount = await fa2.get_ledger_value(key)
    assert(amount?.to_number() === 1)
  })

  it("buy zombie", async () => {
    await market.buy(new Nat(1), new Nat(1), { amount: new Tez(5), as: bob })

    // check that Alice now has 0 zombie
    const key = new ledger_key(alice.get_address(), new Nat(1))
    const amount = await fa2.get_ledger_value(key)
    assert(amount === undefined)

    // check that Bob now has 1 zombie
    const key2 = new ledger_key(bob.get_address(), new Nat(1))
    const amount2 = await fa2.get_ledger_value(key2)
    assert(amount2?.to_number() === 1)
  })
})
