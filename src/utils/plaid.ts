import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { PLAID_CLIENT, PLAID_SECRET, __prod__ } from '../constants'

const configuration = new Configuration({
  basePath: !__prod__ ? PlaidEnvironments.production : PlaidEnvironments.sandbox,
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': PLAID_CLIENT,
      'PLAID-SECRET': PLAID_SECRET,
    },
  },
})

export const client = new PlaidApi(configuration)
