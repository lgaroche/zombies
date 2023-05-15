import * as ex from "@completium/dapp-ts";
import * as att from "@completium/archetype-ts-types";
export class transfer_destination implements att.ArchetypeType {
    constructor(public to_dest: att.Address, public token_id_dest: att.Nat, public token_amount_dest: att.Nat) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): att.Micheline {
        return att.pair_to_mich([this.to_dest.to_mich(), att.pair_to_mich([this.token_id_dest.to_mich(), this.token_amount_dest.to_mich()])]);
    }
    equals(v: transfer_destination): boolean {
        return att.micheline_equals(this.to_mich(), v.to_mich());
    }
    static from_mich(input: att.Micheline): transfer_destination {
        return new transfer_destination(att.Address.from_mich((input as att.Mpair).args[0]), att.Nat.from_mich((att.pair_to_mich((input as att.Mpair as att.Mpair).args.slice(1, 3)) as att.Mpair).args[0]), att.Nat.from_mich((att.pair_to_mich((input as att.Mpair as att.Mpair).args.slice(1, 3)) as att.Mpair).args[1]));
    }
}
export class transfer_param implements att.ArchetypeType {
    constructor(public tp_from: att.Address, public tp_txs: Array<transfer_destination>) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): att.Micheline {
        return att.pair_to_mich([this.tp_from.to_mich(), att.list_to_mich(this.tp_txs, x => {
                return x.to_mich();
            })]);
    }
    equals(v: transfer_param): boolean {
        return att.micheline_equals(this.to_mich(), v.to_mich());
    }
    static from_mich(input: att.Micheline): transfer_param {
        return new transfer_param(att.Address.from_mich((input as att.Mpair).args[0]), att.mich_to_list((input as att.Mpair).args[1], x => { return transfer_destination.from_mich(x); }));
    }
}
export const transfer_destination_mich_type: att.MichelineType = att.pair_array_to_mich_type([
    att.prim_annot_to_mich_type("address", ["%to_"]),
    att.pair_array_to_mich_type([
        att.prim_annot_to_mich_type("nat", ["%token_id"]),
        att.prim_annot_to_mich_type("nat", ["%amount"])
    ], [])
], []);
export const transfer_param_mich_type: att.MichelineType = att.pair_array_to_mich_type([
    att.prim_annot_to_mich_type("address", ["%from_"]),
    att.list_annot_to_mich_type(att.pair_array_to_mich_type([
        att.prim_annot_to_mich_type("address", ["%to_"]),
        att.pair_array_to_mich_type([
            att.prim_annot_to_mich_type("nat", ["%token_id"]),
            att.prim_annot_to_mich_type("nat", ["%amount"])
        ], [])
    ], []), ["%txs"])
], []);
export const order_key_mich_type: att.MichelineType = att.prim_annot_to_mich_type("nat", []);
export class order_value implements att.ArchetypeType {
    constructor(public seller: att.Address, public token_id: att.Nat, public amount: att.Nat, public price: att.Tez) { }
    toString(): string {
        return JSON.stringify(this, null, 2);
    }
    to_mich(): att.Micheline {
        return att.pair_to_mich([this.seller.to_mich(), this.token_id.to_mich(), this.amount.to_mich(), this.price.to_mich()]);
    }
    equals(v: order_value): boolean {
        return att.micheline_equals(this.to_mich(), v.to_mich());
    }
    static from_mich(input: att.Micheline): order_value {
        return new order_value(att.Address.from_mich((input as att.Mpair).args[0]), att.Nat.from_mich((input as att.Mpair).args[1]), att.Nat.from_mich((input as att.Mpair).args[2]), att.Tez.from_mich((input as att.Mpair).args[3]));
    }
}
export const order_value_mich_type: att.MichelineType = att.pair_array_to_mich_type([
    att.prim_annot_to_mich_type("address", ["%seller"]),
    att.prim_annot_to_mich_type("nat", ["%token_id"]),
    att.prim_annot_to_mich_type("nat", ["%amount"]),
    att.prim_annot_to_mich_type("mutez", ["%price"])
], []);
export type order_container = Array<[
    att.Nat,
    order_value
]>;
export const order_container_mich_type: att.MichelineType = att.pair_annot_to_mich_type("map", att.prim_annot_to_mich_type("nat", []), att.pair_array_to_mich_type([
    att.prim_annot_to_mich_type("address", ["%seller"]),
    att.prim_annot_to_mich_type("nat", ["%token_id"]),
    att.prim_annot_to_mich_type("nat", ["%amount"]),
    att.prim_annot_to_mich_type("mutez", ["%price"])
], []), []);
const sell_arg_to_mich = (token_id_: att.Nat, amount_: att.Nat, price_: att.Tez): att.Micheline => {
    return att.pair_to_mich([
        token_id_.to_mich(),
        amount_.to_mich(),
        price_.to_mich()
    ]);
}
const buy_arg_to_mich = (order_id: att.Nat, amount_: att.Nat): att.Micheline => {
    return att.pair_to_mich([
        order_id.to_mich(),
        amount_.to_mich()
    ]);
}
export class Zombie_market {
    address: string | undefined;
    constructor(address: string | undefined = undefined) {
        this.address = address;
    }
    get_address(): att.Address {
        if (undefined != this.address) {
            return new att.Address(this.address);
        }
        throw new Error("Contract not initialised");
    }
    async get_balance(): Promise<att.Tez> {
        if (null != this.address) {
            return await ex.get_balance(new att.Address(this.address));
        }
        throw new Error("Contract not initialised");
    }
    async sell(token_id_: att.Nat, amount_: att.Nat, price_: att.Tez, params: Partial<ex.Parameters>): Promise<att.CallResult> {
        if (this.address != undefined) {
            return await ex.call(this.address, "sell", sell_arg_to_mich(token_id_, amount_, price_), params);
        }
        throw new Error("Contract not initialised");
    }
    async buy(order_id: att.Nat, amount_: att.Nat, params: Partial<ex.Parameters>): Promise<att.CallResult> {
        if (this.address != undefined) {
            return await ex.call(this.address, "buy", buy_arg_to_mich(order_id, amount_), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_sell_param(token_id_: att.Nat, amount_: att.Nat, price_: att.Tez, params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "sell", sell_arg_to_mich(token_id_, amount_, price_), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_buy_param(order_id: att.Nat, amount_: att.Nat, params: Partial<ex.Parameters>): Promise<att.CallParameter> {
        if (this.address != undefined) {
            return await ex.get_call_param(this.address, "buy", buy_arg_to_mich(order_id, amount_), params);
        }
        throw new Error("Contract not initialised");
    }
    async get_fa2(): Promise<att.Address> {
        if (this.address != undefined) {
            const storage = await ex.get_raw_storage(this.address);
            return att.Address.from_mich((storage as att.Mpair).args[0]);
        }
        throw new Error("Contract not initialised");
    }
    async get_order(): Promise<order_container> {
        if (this.address != undefined) {
            const storage = await ex.get_raw_storage(this.address);
            return att.mich_to_map((storage as att.Mpair).args[1], (x, y) => [att.Nat.from_mich(x), order_value.from_mich(y)]);
        }
        throw new Error("Contract not initialised");
    }
    async get_next_order_id(): Promise<att.Nat> {
        if (this.address != undefined) {
            const storage = await ex.get_raw_storage(this.address);
            return att.Nat.from_mich((storage as att.Mpair).args[2]);
        }
        throw new Error("Contract not initialised");
    }
    errors = {
        r4: att.pair_to_mich([att.string_to_mich("\"INVALID_CONDITION\""), att.string_to_mich("\"r4\"")]),
        r3: att.pair_to_mich([att.string_to_mich("\"INVALID_CONDITION\""), att.string_to_mich("\"r3\"")]),
        r2: att.pair_to_mich([att.string_to_mich("\"INVALID_CONDITION\""), att.string_to_mich("\"r2\"")]),
        r1: att.pair_to_mich([att.string_to_mich("\"INVALID_CONDITION\""), att.string_to_mich("\"r1\"")])
    };
}
export const zombie_market = new Zombie_market();
