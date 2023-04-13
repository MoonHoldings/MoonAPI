import { AnchorProvider } from "@project-serum/anchor"
import Wallet from "@project-serum/anchor/dist/cjs/nodewallet"

import { Connection, Keypair } from "@solana/web3.js"
import { HELLO_MOON_RPC_URL } from "../constants"

export const connection = new Connection(HELLO_MOON_RPC_URL as string, "confirmed")

const createAnchorProvider = (wallet?: Wallet, rpc?: string) => {
  const provider = new AnchorProvider(new Connection((HELLO_MOON_RPC_URL ?? rpc) as string, "confirmed"), wallet ?? new Wallet(Keypair.generate()), {
    maxRetries: 2,
  })

  // @ts-ignore
  provider.connection._confirmTransactionInitialTimeout = 180_000

  return provider
}

export default createAnchorProvider
