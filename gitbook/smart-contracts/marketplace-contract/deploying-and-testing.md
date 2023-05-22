---
description: Deploying and testing the marketplace contract
---

# Deploying and testing

The marketplace contract can be deployed without any parameters, as it's token-agnostic:

```
ccli deploy ./contracts/market.arl
```

To create a sale, the `sell` entrypoint is called as follows (replace with the correct values):&#x20;

```
ccli set account alice
ccli call market --entry sell --arg '{"fa2_": "KT1CPHS16kLFHFi5AXNhoYjD67nwsEFr6h7o", "token_id_": 1, "amount_": 1, "price_": 1000000, "expiry_": "2023-09-01 23:00:00"}'
```

Note that the price argument is expressed in mutez, one million-th of a tez. Hence, 1\_000\_000 utez equals 1 ꜩ.

Now let's switch the account and buy the NFT (this will fail):&#x20;

```bash
ccli set account bob
ccli call market --entry buy --arg '{"order_id": 1, "amount_": 1}' --amount 1tz
```

Why did it fail? Remember, the marketplace contract is not allowed to transfer Alice's tokens. She need to first add the marketplace as an approved operator for her tokens. This can be done once for all her tokens with the following call:&#x20;

```bash
ccli set account alice
ccli call tzombies --entry update_operators_for_all --arg '{"upl": [{"add_for_all": "KT1Cj7TkHogPa2SxkqhTvoGK4WkrK3WGa4RW"}]}'
```

Now, try to buy again, it should work!
