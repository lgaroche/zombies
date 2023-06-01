---
description: Write scripts to automate your testing and deployments
---

# Better testing

## Framework

Testing with the CLI is fun, but it quickly gets out-of-hands when we are dealing with multiple contracts, calls, environments. To help you deploy and test more efficiently, Completium comes with two TypeScript SDK to interact with smart contracts:&#x20;

* `@completium/dapp-ts`
* `@completium/experiment-ts`

We will use the first one later, directly in our Next application. It is meant to be ran from the browser. For local development, even though labeled as experimental, we will use the latter.&#x20;

## Installation

We'll need to add some dependencies to use our scripts:

```
yarn add --dev @completium/experiment-ts@0.1.13 ts-mocha@10.0.0
yarn add --dev @types/expect@24.3.0 @types/mocha@9.1.1 @types/node@20.2.3 
```

{% hint style="info" %}
`ts-mocha` is a TypeScript version of the testing framework `mocha`. To enable loading ts modules for our tests, we need to edit the `tsconfig.json` and change `compilerOptions.module` to `"commonjs"`.&#x20;
{% endhint %}

## Script

We create a script in `./tests/deployAndTest.ts`

Before we start writing our script, we'll generate TypeScript bindings of our smart contract, so we can easily interact with them.&#x20;

```
npx completium-cli generate binding-ts * --input-path ./contracts --output-path ./tests/bindings
```

It will generate one TS file per contract, in the `./tests/bindings` folder.&#x20;

In `deployAndTest.ts`, we'll use `mocha` to create test cases, first the required imports:&#x20;

```typescript
import { get_account, set_quiet } from "@completium/experiment-ts"
import { Tzombies, add_for_all } from "./bindings/tzombies"
import { Permits } from "./bindings/permits"
import { Market } from "./bindings/market"
import { Nat, Bytes, Tez } from "@completium/archetype-ts-types"
import { ledger_key } from "./bindings/tzombies"
const assert = require("assert")

// silence completium output:
set_quiet(true)
```

Now we'll instantiate our contracts that are now TS classes:

```typescript
let permits: Permits = new Permits()
let market: Market = new Market()
let fa2: Tzombies = new Tzombies()
```

And get test accounts:&#x20;

```typescript
const alice = get_account("alice")
const bob = get_account("bob")
```

Test cases are grouped in `describe` blocks, and each test will be in a `it` block. See [mocha's documentation](https://mochajs.org/) for more details.&#x20;

The first block simply deploys each contract. We also print the contract addresses as they can be useful when we actually deploy our contracts.

Note how the parameters for the deployment are passed as parameters in the `deploy` function.

```typescript
describe("Contracts deployment", async () => {
  it("permits", async () => {
    await permits.deploy(alice.get_address(), { as: alice })
    console.log("permits: ", permits.get_address())
  })

  it("market", async () => {
    await market.deploy({ as: alice })
    console.log("market: ", market.get_address())
  })

  it("fa2", async () => {
    await fa2.deploy(alice.get_address(), permits.get_address(), { as: alice })
    console.log("fa2: ", fa2.get_address())
  })
})
```

You can already try out your script with the following command (first, you may want to switch to the mockup chain, tests will run faster)

```bash
ccli set endpoint mockup
npx ts-mocha tests/deployAndRegister.ts --timeout 0 --bail
```

{% hint style="info" %}
As you may want to run the script quite often, I recommend adding it to the `package.json` file as a new `"test"` script.
{% endhint %}

The next block will register the Zombie and Brainz NFT, again with their magic token metadata byte string.&#x20;

```typescript
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
      new Nat(1),
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
```

We'll now add a mint test. Mint 1 Zombie (id 1) with Alice's wallet and check her balance.

```typescript
describe("Mint and trade", async () => {
    /* we'll add more test cases in this block */
})
```

In this block, add the mint test:&#x20;

```typescript
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
```

And put it on sale in the next test:&#x20;

```typescript
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
```

As with the CLI testing, we'll check that the buy will fail if the marketplace is not an operator:&#x20;

```typescript
it("buy zombie before operator update should fail", async () => {
    await expect_to_fail(async () => {
      await market.buy(new Nat(1), new Nat(1), { amount: new Tez(5), as: bob })
    }, fa2.errors.INVALID_CALLER)

    // check that Alice still has 1 zombie
    const key = new ledger_key(alice.get_address(), new Nat(1))
    const amount = await fa2.get_ledger_value(key)
    assert(amount?.to_number() === 1)
  })
```

Now let's approve the marketplace for all of Alice's tokens:&#x20;

```typescript
it("approve marketplace", async () => {
    const arg = new add_for_all(market.get_address())
    await fa2.update_operators_for_all([arg], { as: alice })
  })
```

If we try to buy again, but with insufficient funds:&#x20;

```typescript
it("buy zombie without enough tez should fail", async () => {
    await expect_to_fail(async () => {
      await market.buy(new Nat(1), new Nat(1), { amount: new Tez(1), as: bob })
    }, market.errors.r_value)

    // check that Alice still has 1 zombie
    const key = new ledger_key(alice.get_address(), new Nat(1))
    const amount = await fa2.get_ledger_value(key)
    assert(amount?.to_number() === 1)
  })
```

Now with the correct amount, the purchase will go through:&#x20;

```typescript
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
```
