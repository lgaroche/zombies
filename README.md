# TZombies

This is the finalized repository for the [TZombies Tezos NFT tutorial](https://superlouis.gitbook.io/tzombies). It is recommended to follow the tutorial step-by-step, and refer to this repository to verify your code.

The app is deployed on [https://zombies-pi.vercel.app/](https://zombies-pi.vercel.app/).

## Quick command reference

### Setup

```bash
alias ccli="npx completium-cli"
ccli init
ccli start sandbox
ccli switch endpoint http://localhost:20000
ccli switch account alice
```

### Generate bindings

```bash
npx completium-cli generate binding-dapp-ts * --input-path ./contracts --output-path ./contracts/bindings
npx completium-cli generate binding-ts * --input-path ./contracts --output-path ./tests/bindings
```

### Deploy contracts

```bash
ccli deploy contracts/permits.arl --parameters '{"owner": "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb"}'
ccli deploy ./contracts/tzombies.arl --parameters '{"owner": "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", "permits": "<replace permits_contract_address>"}'
ccli deploy ./contracts/market.arl
```

### Register NFTs

```bash
# register the "brainz" NFT
ccli call tzombies --entry set_token_metadata --arg '{"tid": 1, "tdata": [{"key": "", "value": "0x697066733a2f2f516d53445733794257756e7977624c544c78723835784843464d6d747a5372365a55565138433375346161314d65"}]}'
# register the "tzombie" NFT
ccli call tzombies --entry set_token_metadata --arg '{"tid": 2, "tdata": [{"key": "", "value": "697066733a2f2f516d546d65517a55754b37716d467337795466563254434c5a416852466d716d714a793536636b6b7a666a586939"}]}'
```

### Mint

```bash
# mint one NFT
ccli call tzombies --entry mint --amount 2tz --arg '{"tow": "tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb", "tid": 1, "nbt": 1}'
```

### Market

```bash
# create listing
ccli call market --entry list_for_sale --arg '{"fa2_": "<replace fa2 address", "token_id_": 1, "amount_": 1, "price_": 100, "expiry_": "2023-09-01 23:00:00"}'

# approve marketplace on fa2 contract
ccli call tzombies --entry update_operators_for_all --arg '{"upl": [{ "kind": "left", "value": "<replace market address>" }]}'

# switch to buyer account and buy the NFT
ccli set account bob
ccli call market --entry buy --arg '{"order_id": 1, "amount_": 1}' --amount 100utz

# check an operation receipt:
tezos-client -E http://localhost:20000 get receipt for $operation_hash
```
