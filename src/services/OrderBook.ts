import { OrderBook } from '../entities';
import { Service } from 'typedi';

@Service()
export class OrderBookService {

   async getOrderBookById(id: number): Promise<OrderBook> {
      return await OrderBook.findOneOrFail({
         where: { id },
      });
   }
}

