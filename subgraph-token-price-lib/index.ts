import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class UnderlyingTokenPercent {
  address: Address;
  percent: BigDecimal;

  constructor(address: Address, percent: BigDecimal) {
    this.address = address;
    this.percent = percent;
  }
}

let ZERO = BigInt.fromI32(0).toBigDecimal()
let FIFTY_PERCENT = BigInt.fromI32(1).divDecimal(BigInt.fromI32(2).toBigDecimal())

class Token extends ethereum.SmartContract {
  constructor(address: Address) {
    super('Token', address)
  }

  getUnderlying(): UnderlyingTokenPercent[] {
    // let result = super.tryCall(
    //   "getReserves",
    //   "getReserves():(uint112,uint112,uint32)",
    //   []
    // )
    // if (result.reverted) {
    //   return []
    // }

    // let reserve0 = result.value[0].toBigInt()
    // let reserve1 = result.value[0].toBigInt()

    let token0Call = super.tryCall("token0", "token0():(address)", []);
    let token1Call = super.tryCall("token1", "token1():(address)", []);

    if (token0Call.reverted || token1Call.reverted) {
      return []
    }

    return [
      new UnderlyingTokenPercent(token0Call.value[0].toAddress(), FIFTY_PERCENT),
      new UnderlyingTokenPercent(token1Call.value[0].toAddress(), FIFTY_PERCENT),
    ]

    // let value = result.value;
    // return ethereum.CallResult.fromValue(value[0].toBigInt());

    // return []
  }
}

export function getPrice(token: Address): BigDecimal {
  let contract = new Token(token)
  let underlying = contract.getUnderlying()
  if (underlying.length > 0) {
    let price = BigInt.fromI32(0).toBigDecimal()
    for (let i = 0; i < underlying.length; i += 1) {
      price += getPrice(underlying[i].address) * underlying[0].percent
    }
    return price
  }

  
}
