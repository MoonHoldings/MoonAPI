import axios from 'axios'
import { COIN_API_CONFIG } from '../constants'

const getFXRate = async (base: string, quote: string): Promise<{ time: string; asset_id_base: string; asset_id_quote: string; rate: number }> => {
  const { data } = await axios.get(`https://rest.coinapi.io/v1/exchangerate/${base}/${quote}`, COIN_API_CONFIG)
  return data
}

export default getFXRate
