import { Loan } from '../entities';
import { Service } from 'typedi';

@Service()
export class LoanService {

   async getLoanById(id: number): Promise<Loan> {
      return await Loan.findOneOrFail({ where: { id }, });
   }
}
