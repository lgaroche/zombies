```bash
ccli generate binding-dapp-ts fa2.arl --input-path ./contracts --output-path ./contracts
docker run --rm --name my-sandbox --detach -p 20000:20000 --cpus 1 -e block_time=10 oxheadalpha/flextesa:latest limabox start
ccli deploy ./contracts/fa2.arl
ccli call fa2 --entry register --arg '{"id": 1, "info": [{"key": "", "value": "0x00"}]}'
ccli call fa2 --entry mint --arg '{"id": 1}'
```
