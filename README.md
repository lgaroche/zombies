```bash

ccli generate binding-dapp-ts fa2.arl --input-path ./contracts --output-path ./contracts/bindings
ccli generate binding-dapp-ts market.arl --input-path ./contracts --output-path ./contracts/bindings

docker run --rm --name my-sandbox --detach -p 20000:20000 --cpus 1 -e block_time=10 oxheadalpha/flextesa:latest limabox start

ccli deploy ./contracts/fa2.arl
ccli deploy ./contracts/market.arl --parameters '{"fa2": "KT1UzmTDkDHE18vwc5bF1TASaJu3fnMdFriN"}'


# register the "brainz" NFT
ccli call fa2 --entry register --arg '{"id": 1, "info": [{"key": "", "value": "0x697066733a2f2f516d53445733794257756e7977624c544c78723835784843464d6d747a5372365a55565138433375346161314d65"}]}'
# register the "tzombie" NFT
ccli call fa2 --entry register --arg '{"id": 2, "info": [{"key": "", "value": "697066733a2f2f516d546d65517a55754b37716d467337795466563254434c5a416852466d716d714a793536636b6b7a666a586939"}]}'

# mint one NFT
ccli call fa2 --entry mint --arg '{"id": 1}'

# create sale
ccli call market --entry sell --arg '{"token_id_": 1, "amount_": 1, "price_": 100, "expiry_": "2023-06-01 23:00:00"}'

# switch to buyer account and buy the NFT
ccli set account bob
ccli call market --entry buy --arg '{"order_id": 1, "amount_": 1}' --amount 100utz

# check an operation receipt:
tezos-client -E http://localhost:20000 get receipt for $operation_hash

```
