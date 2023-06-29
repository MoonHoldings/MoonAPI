import { createSharkyClient } from '@sharkyfi/client'
import createAnchorProvider from './createAnchorProvider'

const provider = createAnchorProvider()
const sharkyClient = createSharkyClient(provider, undefined, 'mainnet')

export default sharkyClient
