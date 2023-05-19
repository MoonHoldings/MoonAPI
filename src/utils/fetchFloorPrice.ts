import axios from 'axios'
import { HELLO_MOON_URL, AXIOS_CONFIG_HELLO_MOON_KEY } from '../constants'

const fetchFloorPrice = async (id: any) => {
  const res = await axios.post(
    `${HELLO_MOON_URL}/nft/collection/floorprice`,
    {
      helloMoonCollectionId: id,
    },
    AXIOS_CONFIG_HELLO_MOON_KEY
  )

  return res?.data?.data?.length ? res?.data?.data[0] : undefined
}

export default fetchFloorPrice
