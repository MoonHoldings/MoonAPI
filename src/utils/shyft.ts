import { SHYFT_KEY } from "../constants";
import { ShyftSdk, Network } from '@shyft-to/js';

export const shyft = new ShyftSdk({ apiKey: SHYFT_KEY, network: Network.Mainnet });
