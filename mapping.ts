import { BigInt } from "@graphprotocol/graph-ts"
import { RedeemLocalCallback, SwapCall, SwapRemoteCall, CreatePoolCall, AddLiquidityCall, InstantRedeemLocalCall } from "../generated/Contract/Contract"
import { Swap, Pool, Liquidity } from "../generated/schema"


// General
const CURRENT_CHAIN		=	1


export function onRLC(event: RedeemLocalCallback): void {


  let entity = Pool.load(event.params.dstPoolId.toHex())
  
  if (!entity) {
    entity = new Pool(event.params.dstPoolId.toHex())
  } 
  

  let CURRENT_TVL			=	entity.totalValueLocked
  if (!CURRENT_TVL) {
  	CURRENT_TVL	=	BigInt.fromI32(0)
  }
  
  let TO_MIN				=	event.params.amountSD
  entity.totalValueLocked	=	CURRENT_TVL - TO_MIN
  
  entity.save()
}


export function onSWAP(call: SwapCall): void {
  let entity = Swap.load(call.transaction.hash.toHex())

  if (!entity) {
    entity = new Swap(call.transaction.hash.toHex())
  }
  
  
  entity.dstChainId		=	BigInt.fromI32(call.inputs._dstChainId)
  entity.dstPoolId		=	call.inputs._dstPoolId

  entity.srcChainId		=	BigInt.fromI32(CURRENT_CHAIN)
  entity.srcPoolId		=	call.inputs._srcPoolId
  entity.pool			=	call.inputs._srcPoolId.toHex()
  
  entity.refundAddress		=	call.inputs._refundAddress
  entity.recipientAddress	=	call.inputs._to
  
  entity.amountLD		=	call.inputs._amountLD
  entity.minAmountLD	=	call.inputs._minAmountLD
  
  entity.blockNumber	=	call.block.number
  entity.timestamp		=	call.block.timestamp
  entity.txHash			=	call.transaction.hash
  
  entity.save()
  

  let updatePool = Pool.load(call.inputs._srcPoolId.toHex())

  if (!updatePool) {
    updatePool = new Pool(call.inputs._srcPoolId.toHex())
  } 


  let CURRENT_TVL			=	updatePool.totalValueLocked
  if (!CURRENT_TVL) {
  	CURRENT_TVL	=	BigInt.fromI32(0)
  }
  
  let TO_ADD					=	call.inputs._amountLD
  updatePool.totalValueLocked	=	CURRENT_TVL + TO_ADD
  
  updatePool.save()
  
  let liquidAction = Liquidity.load(call.transaction.hash.toHex())
  if(!liquidAction) {
  	liquidAction = new Liquidity(call.transaction.hash.toHex())
  }
  
  liquidAction.poolId			=	call.inputs._srcPoolId
  liquidAction.action			=	"ADD"
  liquidAction.functionCalled	=	"Swap"
  
  liquidAction.user			=	call.inputs._to
  liquidAction.amount		=	call.inputs._amountLD
  
  liquidAction.tokenAddress		=	updatePool.token
  liquidAction.tokenName		=	updatePool.name
  liquidAction.tokenSymbol		=	updatePool.symbol
  liquidAction.tokenDecimals	=	updatePool.localDecimals
	
  liquidAction.txHash		=	call.transaction.hash
  liquidAction.blockNumber	=	call.block.number
  liquidAction.timestamp	=	call.block.timestamp
  
  liquidAction.save()
  
}



export function onSWAPREMOTE(call: SwapRemoteCall): void {
  let entity = Swap.load(call.transaction.hash.toHex())

  if (!entity) {
    entity = new Swap(call.transaction.hash.toHex())
  }
  
  
  // Current chain + current pool
  entity.dstChainId		=	BigInt.fromI32(CURRENT_CHAIN)
  entity.dstPoolId		=	call.inputs._dstPoolId

  // From chain + From pool
  entity.srcChainId		=	BigInt.fromI32(call.inputs._srcChainId)
  entity.srcPoolId		=	call.inputs._srcPoolId
  
  // Pool = dstPoolId
  entity.pool			=	call.inputs._dstPoolId.toHex()
  
  // Refund = srcAddress
  entity.refundAddress		=	call.inputs._to
  entity.recipientAddress	=	call.inputs._to
  
  
  // Real amount = call.inputs._s.amount + call.inputs._s.eqReward
  entity.amountLD		=	call.inputs._s.amount + call.inputs._s.eqReward
  entity.minAmountLD	=	call.inputs._s.amount + call.inputs._s.eqReward
  
  entity.blockNumber	=	call.block.number
  entity.timestamp		=	call.block.timestamp
  entity.txHash			=	call.transaction.hash
  
  entity.save()
  

  let updatePool = Pool.load(call.inputs._dstPoolId.toHex())

  if (!updatePool) {
    updatePool = new Pool(call.inputs._dstPoolId.toHex())
  } 
  

  let CURRENT_TVL			=	updatePool.totalValueLocked
  if (!CURRENT_TVL) {
  	CURRENT_TVL	=	BigInt.fromI32(0)
  }
  
  let TO_MIN					=	call.inputs._s.amount + call.inputs._s.eqReward
  updatePool.totalValueLocked	=	CURRENT_TVL - TO_MIN
  
  updatePool.save()
  
  
  let liquidAction = Liquidity.load(call.transaction.hash.toHex())
  if(!liquidAction) {
  	liquidAction = new Liquidity(call.transaction.hash.toHex())
  }

  liquidAction.poolId			=	call.inputs._dstPoolId
  liquidAction.action			=	"REMOVE"
  liquidAction.functionCalled	=	"SwapRemote"

  liquidAction.user			=	call.inputs._to
  liquidAction.amount		=	call.inputs._s.amount + call.inputs._s.eqReward

  liquidAction.tokenAddress		=	updatePool.token
  liquidAction.tokenName		=	updatePool.name
  liquidAction.tokenSymbol		=	updatePool.symbol
  liquidAction.tokenDecimals	=	updatePool.localDecimals
	
  liquidAction.txHash		=	call.transaction.hash
  liquidAction.blockNumber	=	call.block.number
  liquidAction.timestamp	=	call.block.timestamp
  
  liquidAction.save()
  
}



export function onCREATEPOOL(call: CreatePoolCall): void {
  let entity = Pool.load(call.inputs._poolId.toHex())

  if (!entity) {
    entity = new Pool(call.inputs._poolId.toHex())
  }
  
  entity.poolId				=	call.inputs._poolId
  entity.poolAddress		=	call.outputs.value0
 
  entity.token				=	call.inputs._token
  entity.sharedDecimals		=	BigInt.fromI32(call.inputs._sharedDecimals)
  entity.localDecimals		=	BigInt.fromI32(call.inputs._localDecimals)
  
  entity.name				=	call.inputs._name
  entity.symbol				=	call.inputs._symbol
  
  entity.creationBlockNumber	=	call.block.number
  entity.creationTimestamp		=	call.block.timestamp
  
  entity.creationTxHash		=	call.transaction.hash
  
  entity.save()
}




export function onADDLIQUIDITY(call: AddLiquidityCall): void {
  let entity = Pool.load(call.inputs._poolId.toHex())

  if (!entity) {
    entity = new Pool(call.inputs._poolId.toHex())
  }
  

  let CURRENT_TVL			=	entity.totalValueLocked
  if (!CURRENT_TVL) {
  	CURRENT_TVL	=	BigInt.fromI32(0)
  }
  
  let TO_ADD				=	call.inputs._amountLD
  entity.totalValueLocked	=	CURRENT_TVL + TO_ADD
  entity.save()
  
  let liquidAction = Liquidity.load(call.transaction.hash.toHex())
  if(!liquidAction) {
  	liquidAction = new Liquidity(call.transaction.hash.toHex())
  }
  

  liquidAction.poolId			=	call.inputs._poolId
  liquidAction.action			=	"ADD"
  liquidAction.functionCalled	=	"addLiquidity"

  liquidAction.user			=	call.inputs._to
  liquidAction.amount		=	call.inputs._amountLD

  liquidAction.tokenAddress		=	entity.token
  liquidAction.tokenName		=	entity.name
  liquidAction.tokenSymbol		=	entity.symbol
  liquidAction.tokenDecimals	=	entity.localDecimals
	
  liquidAction.txHash		=	call.transaction.hash
  liquidAction.blockNumber	=	call.block.number
  liquidAction.timestamp	=	call.block.timestamp
  
  liquidAction.save()
}




export function onREMOVELIQUIDITY(call: InstantRedeemLocalCall): void {
  let entity = Pool.load(call.inputs._srcPoolId.toHex())
  
  if (!entity) {
    entity = new Pool(call.inputs._srcPoolId.toHex())
  }
  
  
  let CURRENT_TVL			=	entity.totalValueLocked
  if (!CURRENT_TVL) {
  	CURRENT_TVL	=	BigInt.fromI32(0)
  }
  
  let TO_MIN				=	call.outputs.amountSD
  entity.totalValueLocked	=	CURRENT_TVL - TO_MIN
  
  entity.save()
  
  let liquidAction = Liquidity.load(call.transaction.hash.toHex())
  if(!liquidAction) {
  	liquidAction = new Liquidity(call.transaction.hash.toHex())
  }
  

  liquidAction.poolId			=	call.inputs._srcPoolId
  liquidAction.action			=	"REMOVE"
  liquidAction.functionCalled	=	"InstantRedeemLocal"

  liquidAction.user			=	call.inputs._to
  liquidAction.amount		=	call.outputs.amountSD
  
  liquidAction.tokenAddress		=	entity.token
  liquidAction.tokenName		=	entity.name
  liquidAction.tokenSymbol		=	entity.symbol
  liquidAction.tokenDecimals	=	entity.localDecimals
	
  liquidAction.txHash		=	call.transaction.hash
  liquidAction.blockNumber	=	call.block.number
  liquidAction.timestamp	=	call.block.timestamp
  
  liquidAction.save()
}

