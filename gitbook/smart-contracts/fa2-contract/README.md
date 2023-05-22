---
description: Archetype multi-asset FA2 contract
---

# FA2 Contract

## Template

The archetype-lang developers published some [templates for common or standardised contracts](https://archetype-lang.org/docs/templates/overview). The one we're interested in is the FA2 multi-asset contract, that can be found on their [GitHub](https://github.com/completium/archetype-fa2).

We'll use the [`fa2_multi`](https://github.com/completium/archetype-fa2/blob/main/contracts/fa2\_multi.arl) base that we'll adjust according to our needs.

{% hint style="info" %}
The completium team has made a [comprehensive documentation](https://archetype-lang.org/docs/templates/fa2/) on the FA2 template and the archetype language. I recommend taking some time to read and understand the contract logic before moving on.&#x20;
{% endhint %}

Create a `contracts` folder in your repository, and download `permits.arl` and `fa2_multi.arl` in there.&#x20;

The main logic is in `fa2_multi`, whereas the `permits` contract implements special features for the NFT (such as transfer with a permit, that allows the owner to sign a message to allow another account or contract to transfer its NFT). &#x20;

## Adjustments

We'll do the following changes to the FA2 template

### Rename the contract

The first line is the contract declaration, we'll rename it to fit our project:

```
archetype tzombies(owner : address, permits : address) with metadata ""
```

We keep the rest of the line as is, the parameters are the contract initialization parameters, we see here that we can define a contract owner, and the address of the permits contract. These will be set during deployment. `with metadata` is a way to include contract metadata (contract metadata is used to identify the contract on block explorers, not to confuse with token metadata)

### Remove token metadata initialisation

The template comes with a default token metadata for token with id 0. Let's remove that. Look for section TOKEN METADATA, remove the constants and the initialized by arguments:

```
/* TOKEN METADATA ------------------------------------------------------------ */

asset token_metadata to big_map {
  ftoken_metadata : nat;
  token_id        : nat;
  token_info      : map<string, bytes>;
}
```

{% hint style="info" %}
Note that it could be a good idea to change the `set_token_metadata` entrypoint to allow setting it only once, and prevent the update. This would be if you'd want to have immutable metadata for your tokens.&#x20;

```
entry set_token_metadata (tid : nat, tdata: map<string, bytes>) {
  no transfer
  called by owner
  require { tmd_r1: is_not_paused() }
  effect {
    token_metadata.add({ ftoken_metadata: tid; token_id = tid; token_info = tdata });
  }
}
```
{% endhint %}

### Remove permits update

In the default template, the contract owner has the ability to change the permits contract associated. Even though that's a practical solution if the permits contract needs to be updated or fixed, it creates a hazard risk, as the owner could perform a malicious change.&#x20;

```
// Remove this section: 
/* PERMITS ----------------------------------------------------------------- */

entry set_permits(p : address) {
  no transfer
  called by owner
  require { p_r1 : is_not_paused() }
  effect {
    permits := p
  }
}
```

### The mint function

We'll customize the `mint` function that comes with the template.&#x20;

1. We'd like to have an "open mint" NFT, where anyone can mint. Also, all mints are free, except for token id 1 that will cost 2 ꜩ. See the [design](../../#design) chapter.
2. For the sake of the tutorial, we'll refund the cost of the NFT to the caller. This will be especially useful when using Wert, as they will not lose too many testnet coins. In a real life contract, we could forward the sales product to the owner, or keep it on the contract and have a `withdraw` entrypoint callable only by an approved address.

```
entry mint (tow : address, tid : nat, nbt : nat) {
  require {
     fa2_r5: is_not_paused();
     fa2_r6: token_metadata.contains(tid) otherwise FA2_TOKEN_UNDEFINED;
  }
  effect {
    if tid = 1 then begin
      do_require(transferred = 2tz, "This token costs 2tz");
      transfer 2tz to caller; // for the tutorial: refund the buyer immediately
    end;

    ledger.add_update((tow, tid), { lamount += nbt });
  }
}
```
