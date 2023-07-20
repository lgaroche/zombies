---
description: Simple marketplace contract in Archetype
---

# Marketplace contract

This one will be created from scratch.

{% hint style="info" %}
The contract shown here is very basic and not optimised. It will be left to the reader to extend its functionalities.&#x20;
{% endhint %}

Create a new file `./contracts/market.arl`

The first line is the name declaration:&#x20;

```
archetype market
```

Next, we'll re-define the FA2 transfer parameter types that the contract will need to use to send transfer calls to the FA2 contract. They are very specific to the [FA2 spec](https://tzip.tezosagora.org/proposal/tzip-12/).

```archetype
record transfer_destination {
  to_dest           : address;
  token_id_dest     : nat;
  token_amount_dest : nat
} as ((%to_, (token_id, amount)))

record transfer_param {
  tp_from : address;
  tp_txs  : list<transfer_destination>;
} as ((%from_, %txs))
```

The marketplace contract will accept sale orders from collectors. For simplicity, the contract will accept any order, without checking the ownership of the token. Transfers will be enforced during the purchase and will fail if the seller does not own the tokens. The user interface will need to filter out invalid sale orders.&#x20;

Orders are identified by a unique order id.

Parameters include the FA2 contract address (making this marketplace token-agnostic), the seller address, the token id, how many tokens are for sale, the price for each token, and an expiry date.&#x20;

```archetype
asset order identified by id to big_map {
    id: nat;
    fa2: address;
    seller: address;
    token_id: nat;
    amount: nat;
    price: tez;
    expiry: date;
}
```

We need to keep track of orders:

```
variable next_order_id: nat = 1
```

Let's now create an entrypoint to list a token item for sale. The only conditions are that the amount is non-zero and that the expiry date is in the future. These conditions will prevent some invalid sale orders to be published.

However, the marketplace contract will not validate the amount of tokens owned by the seller. This would require tracking balance updates and add too much complexity to the smart contract. Instead, the orders will be filtered by [the client](../../front-end/market/market-page.md).

{% hint style="info" %}
Note how we use a simple counter to track the order ids. This will help us to enumerate the orders from the client side. It means that the client will have to get all order history and filter out expired and filled ones. This may not be optimal.

A more robust solution would be to run an off-chain indexer (or integrate an existing one such as [tzkt](https://api.tzkt.io/)), that will keep track of all the created and expired orders.&#x20;
{% endhint %}

```archetype
entry list_for_sale(fa2_: address, token_id_: nat, amount_: nat, price_: tez, expiry_: date) {
    require {
        r_sell_amount: amount_ > 0 otherwise "Amount cannot be zero";
        r_expiry: expiry_ > now otherwise "Expiry must be in the future";
    }

    effect {
        order.put({
            fa2 = fa2_;
            id = next_order_id;
            seller = caller;
            token_id = token_id_;
            amount = amount_;
            price = price_;
            expiry = expiry_
        });
        next_order_id += 1;
    }
    
}
```

The seller should be able to change their mind and cancel the order. Note how we check that only the seller can call this entrypoint.&#x20;

```archetype
entry remove_listing(order_id: nat) {
    require {
        r_order_remove: order.contains(order_id) otherwise "Order not found";
        r_owner: order[order_id].seller = caller otherwise "Only the owner can remove the listing";
    }
    effect {
        order.remove(order_id);
    }
}
```

Now, buyers will call another entrypoint, that will do the following:&#x20;

1. Check that the bought amount is non-zero: `r_buy_amount`
2. Check that the order exists and that there are still tokens remaining to be sold: `r_order`
3. Check that the amount sent with the transaction matches the price: `r_value`
4. Check that the order didn't expire: `r_expired`
5. Prepare the records required to call the `%transfer` entrypoint on the contract of the listed token
6. Update the orders big map with the new amount
7. Call the FA2 contract to transfer the token from the seller to the buyer
8. Transfer the tez coins from the buyer to the seller

{% hint style="info" %}
Important: By default, only the token owner is allowed to transfer their tokens. In this case, the buyer instructs the marketplace to transfer someone else's token. To allow this behavior, the token owner must approve the marketplace contract to transfer their tokens. On Tezos, we call the marketplace an `operator`.\
Adding the marketplace as an operator will be done in the next section (calling `update_operators_for_all` on the token contract).
{% endhint %}

```archetype
entry buy(order_id: nat, amount_: nat) {
    require {
        r_buy_amount: amount_ > 0;
        r_order: order.contains(order_id) and order[order_id].amount >= amount_;
        r_value: transferred = amount_ * order[order_id].price;
        r_expired: order[order_id].expiry > now;
    }
    effect {
        order.update(order_id, {
            amount -= amount_
        });

        const order_ ?= order[order_id];
        
        // prepare the relevant records for the transfer
        const this_tx_dest: transfer_destination = {
            to_dest = caller;
            token_id_dest = order_.token_id;
            token_amount_dest = amount_
        };

        const this_tx_param: transfer_param = {
          tp_from = order_.seller;
          tp_txs = [this_tx_dest]
        };

        /* Call the FA2 contract to transfer the tokens.
         * This is how we call another contract, there is no value to transfer, so we pass 0tz
         * Note that `transfer` is a reserved keyword in the archetype langage, but that
         * `%transfer` is the name for an entrypoint as specified in the fa2 standard.
         * %transfer takes a list of transfer_param records and executes the corresponding transfers.
         * In this case, only a single transfer is required, so we pass a list of length 1.
         */
        transfer 0tz to order_.fa2 call %transfer<list<transfer_param>>([this_tx_param]);

        // transfer the tez to the seller
        transfer transferred to order_.seller
    }
```

And our marketplace contract is now ready 😮‍💨
