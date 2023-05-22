import axios from 'axios'
import { HELLO_MOON_URL, AXIOS_CONFIG_HELLO_MOON_KEY } from '../constants'

const fetchHelloMoonCollectionIds = async (addresses: any[], paginationToken?: string) => {
  const { data: collectionIdResponse } = await axios.post(
    `${HELLO_MOON_URL}/nft/collection/mints`,
    {
      nftMint: addresses,
      paginationToken,
    },
    AXIOS_CONFIG_HELLO_MOON_KEY
  )

  return collectionIdResponse
}

export default fetchHelloMoonCollectionIds
