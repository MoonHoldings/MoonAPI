import { AnchorProvider } from "@project-serum/anchor"
import Wallet from "@project-serum/anchor/dist/cjs/nodewallet"

import { Connection, Keypair } from "@solana/web3.js"
import { RPC_URL } from "../constants"

export const connection = new Connection(RPC_URL as string, "confirmed")
// export const connection = new Connection(RPC_URL, {
//   httpHeaders: {
//     Authorization: `Bearer ${HELLO_MOON_KEY}`,
//   },
// })

const createAnchorProvider = (wallet?: Wallet, rpc?: string) => {
  const provider = new AnchorProvider(new Connection((RPC_URL ?? rpc) as string, "confirmed"), wallet ?? new Wallet(Keypair.generate()), {
    maxRetries: 2,
  })

  // @ts-ignore
  provider.connection._confirmTransactionInitialTimeout = 180_000

  return provider
}

export default createAnchorProvider
