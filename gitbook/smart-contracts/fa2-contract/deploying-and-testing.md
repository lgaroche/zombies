---
description: How to deploy and test our FA2 contract.
---

# Deploying and testing

## Deployment

Now that we have the contract code ready, let's deploy it on our sandbox.

There are multiple ways of doing this, the first one we'll see is by using `completium-cli` directly.&#x20;

Make sure you are on the `mockup` or `sandbox` endpoint, and run the `deploy` command. We'll need to deploy the permits contract first, it takes the owner as a parameter (we'll use the alice account)

```bash
ccli switch endpoint # select sandbox (if running) or mockup
ccli swtich account # select alice (tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb)
ccli deploy contracts/permits.arl --parameters '{"owner": "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"}'
```

You will see the origination output, and find the originated contract address in something like this:&#x20;

```
Origination completed for KT1EYVjiiX2HSjqqgqEryqjCCeTpC7rKRMFo named permits.
```

This means that our permits contract has address `KT1EYVjiiX2HSjqqgqEryqjCCeTpC7rKRMFo`.

Let's use this to deploy our fa2 contract (make sure to replace the permits address with the one you deployed):&#x20;

```
ccli deploy ./contracts/tzombies.arl --parameters '{"owner": "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", "permits": "KT1EYVjiiX2HSjqqgqEryqjCCeTpC7rKRMFo"}'
```

You will get the origination output similar to this:&#x20;

```
Origination completed for KT1CPHS16kLFHFi5AXNhoYjD67nwsEFr6h7o named tzombies.
```

Now we have `KT1CPHS16kLFHFi5AXNhoYjD67nwsEFr6h7o` as our fa2 contract.&#x20;

## Testing

We can keep using the command line to register tokens and test some minting.&#x20;

The FA2 contract has a `set_token_metadata` entrypoint. This adds metadata to a given token id. We consider it's like "registering" a token on our contract. We can call our entrypoint with the following command (we'll get into the meaning of these parameters later).

```
ccli call tzombies --entry set_token_metadata --arg '{"tid": 1, "tdata": [{"key": "", "value": "0x697066733a2f2f516d53445733794257756e7977624c544c78723835784843464d6d747a5372365a55565138433375346161314d65"}]}'
```

The `call` function on completium-cli is used to send a transaction that calls an entrypoint on our contract. Here we registered token id (`tid`) 1, with some metadata.&#x20;

The command outputs an operation hash (`Operation injected: o...`), this is the unique identifier of your transaction. It allows you to check the receipt, see if has been applied correctly to the chain, and even see the state changes that happened. For this, we'll use `octez-client` (replace the URL with your sandbox RPC URL)&#x20;

```
octez-client -E http://localhost:20000 get receipt for <operation_hash>
```

We can now test the mint entrypoint:

```
ccli call tzombies --entry mint --arg '{"tow": "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", "tid": 1, "nbt": 1}' --amount 2tz
```

As you can see, the call is pretty straightforward. `tid` is the token id we just declared, `tow` is the recipient address (here Alice again) and `nbt` is the amount of tokens we want to mint. Note that since it's token id 1, we need to send 2ꜩ with the transaction, with the parameter `--amount`.

We will see later an easier way of deploying and testing using JS scripts.&#x20;
