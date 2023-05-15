```bash

ccli generate binding-dapp-ts fa2.arl --input-path ./contracts --output-path ./contracts/bindings
ccli generate binding-dapp-ts market.arl --input-path ./contracts --output-path ./contracts/bindings

docker run --rm --name my-sandbox --detach -p 20000:20000 --cpus 1 -e block_time=10 oxheadalpha/flextesa:latest limabox start

ccli deploy ./contracts/fa2.arl
ccli deploy ./contracts/market.arl --parameters '{"fa2": "KT1UzmTDkDHE18vwc5bF1TASaJu3fnMdFriN"}'


ccli call fa2 --entry register --arg '{"id": 1, "info": [{"key": "", "value": "0x00"}]}'
ccli call fa2 --entry register --arg '{"id": 2, "info": [{"key": "", "value": "0x00"}]}'

# mint one NFT
ccli call fa2 --entry mint --arg '{"id": 1}'

# create sale
ccli call market --entry sell --arg '{"token_id_": 1, "amount_": 1, "price_": 100}'

# switch to buyer account and buy the NFT
ccli set account bob
ccli call market --entry buy --arg '{"order_id": 1, "amount_": 1}' --amount 100utz

# check an operation receipt:
tezos-client -E http://localhost:20000 get receipt for $operation_hash

```
