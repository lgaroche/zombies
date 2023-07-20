---
description: Archetype multi-asset FA2 contract
---

# FA2 Contract

## Template

The archetype-lang developers published some [templates for common or standardised contracts](https://archetype-lang.org/docs/templates/overview). The one we're interested in is the FA2 multi-asset contract, that can be found on their [GitHub](https://github.com/completium/archetype-fa2).

We'll use the [`fa2_multi`](https://github.com/completium/archetype-fa2/blob/main/contracts/fa2\_multi.arl) base that we'll adjust according to our needs.

{% hint style="info" %}
The completium team maintains [comprehensive documentation](https://archetype-lang.org/docs/templates/fa2/) on the FA2 template and the archetype language. I recommend taking some time to read and understand the contract logic before moving on.
{% endhint %}

Go to the [Archetype FA2 Contract Repo](https://github.com/completium/archetype-fa2/tree/main/contracts).

Create a new contracts folder within the tzombies folder and add a copy of `permits.arl` and `fa2_multi.arl`

The main logic is in `fa2_multi`, whereas the `permits` contract implements special features for the NFT (such as transfer with a permit, that allows the owner to sign a message to allow another account or contract to transfer its NFT). &#x20;

## Adjustments

We will make the following changes to the FA2 template to suit our project:

* Rename the contract
* Remove token metadata initialisation
* Remove permits update
* Customise the mint function

### Rename the contract

The first line is the contract declaration, we'll rename it to fit our project:

```
archetype tzombies(owner : address, permits : address) with metadata ""
```

We keep the rest of the declaration defines the parameters required for contract initialization. We can see here that a contract owner, and an address for a permits contract must be given at deployment.

`with metadata` is an optional key for defining contract metadata. Contract metadata is used to identify the contract on block explorers and wallets, (not to be confused with token metadata). Here, we leave it out with `""` but the whole key can be removed. Detailed information on contract metadata can be found in the [TZIP-16 proposal](https://tzip.tezosagora.org/proposal/tzip-16/).

{% hint style="warning" %}
Completium-cli requires the file name  to match the contract name. Rename `fa2_multi.arl` to `tzombies.arl`
{% endhint %}

### Remove token metadata initialisation

The template comes with a default token metadata for a token with id 0. Let's remove that. Look for section TOKEN METADATA and remove the constants and the initialized by arguments. It should now look like this:

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
    token_metadata.add({ ftoken_metadata = tid; token_id = tid; token_info = tdata });
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

We'll customise the `mint` function that comes with the template.&#x20;

1. We'd like to have an "open mint" NFT, where anyone can mint. Also, all mints are free, except for token id 1 that will cost 2 ꜩ. See the [design](../../#design) chapter.
2. In the `effect` section, we'll transfer the sale product for the payable token to the contract owner.&#x20;

```
entry mint (tow : address, tid : nat, nbt : nat) {
  require {
     fa2_r5: is_not_paused();
     fa2_r6: token_metadata.contains(tid) otherwise FA2_TOKEN_UNDEFINED;
  }
  effect {
    if tid = 1 then begin
      do_require(transferred = nbt * 2tz, "This token costs 2tz");
      transfer transferred to owner;
    end;

    ledger.add_update((tow, tid), { lamount += nbt });
  }
}
```
