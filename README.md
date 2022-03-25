# Current subgraph link

This subgraph is available and hosted here : https://thegraph.com/hosted-service/subgraph/goldennaim/stargate


# Example 

### Get pools

If you want to have the first 10 pools :

```graphql
{
  pools(first: 10) {
    poolId              # ID of the pool
    poolAddress         # The address
    token               # The token
    name                # Current name of the pool
    totalValueLocked    # The number of available token
    localDecimals       # The number of decimals
  }
}
```

### Search pool by token

If you want to search a pool by a token, let's say USDC ( **0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48** ) 

```graphql
{
  pools(first: 10,where:{token:"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"}) {
    poolId              # ID of the pool
    poolAddress         # The address
    token               # The token
    name                # Current name of the pool
    totalValueLocked    # The number of available token
    localDecimals       # The number of decimals
  }
}
```


### Get last 10 swaps 

This query will show you the last 10 swaps, ordered by **timestamp**

```graphql
{
  swaps(first:10,orderBy:timestamp,orderDirection:desc) {
    dstChainId            # ID of the destinary chain
    dstPoolId             # ID of the destinary pool
    srcChainId            # ID of the issuing chain
    srcPoolId             # ID of the issuing pool
    recipientAddress      # Address of the recipient 
    amountLD              # Amount
    txHash                # Hash of the transaction
    pool {
      poolId
      name
      symbol
      localDecimals
    }
  }
}
```


### Search swaps by user address

```graphql
{
  swaps(where:{recipientAddress:"0x58954a8209c5758a0c23d00e5695a900877e38ee"},first:10,orderBy:timestamp,orderDirection:desc) {
    dstChainId            # ID of the destinary chain
    dstPoolId             # ID of the destinary pool
    srcChainId            # ID of the issuing chain
    srcPoolId             # ID of the issuing pool
    recipientAddress      # Address of the recipient 
    amountLD              # Amount
    txHash                # Hash of the transaction
    pool {
      poolId
      name
      symbol
      localDecimals
    }
  }
}
```

### Note
If you want to have the real amount, it must be divised by ( 10e**localDecimals** *-1*).

For example, **USDC** and **USDT** have **6 decimals**, if the amount showed is **14991450091**,

the real amount = 14991450091/**10e5** = 14,991.450091

Example tx : https://etherscan.io/tx/0xf99845baecfcdd84097c30f29cab13b6b03371f516763c0406245f1608802e52

Example query :

```graphql
{
  swaps(where:{txHash:"0xf99845baecfcdd84097c30f29cab13b6b03371f516763c0406245f1608802e52"}) {
    amountLD              # Amount
    txHash                # Hash of the transaction
    pool {
      poolId
      name
      symbol
      localDecimals
    }
  }
}
```


# How to deploy a subgraph

You must have npm installed, then type :
npm install -g @graphprotocol/graph-cli

1. mkdir subgraph_stargate
2. cd subgraph_stargate
3. graph init --product hosted-service --from-contract 0x8731d54E9D02c286767d56ac03e8037C07e01e98
4. graph codegen
5. graph build
6. graph auth --product hosted-service YOUR_KEY_HERE
7. graph deploy --product hosted-service USERNAME/SUBGRAPH_NAME
