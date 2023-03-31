import moment from 'moment';

export interface Line {
  dateTime: moment.Moment,
  type: string,
  symbol: string,
  account: string,
  'trade price': string,
  'realized pnl': string,
  'realized funding': string,
  fee: string
  'funding rate': string,
  uid: string,
  'new average entry price': string,
  'new balance': string,
  change: string,
}

export default class KrakenFuturesAdapter {

  static processCsvData(lines: Line[]): Array<Position> {
    lines = lines.reverse();
    const validTypes = ['funding rate change', 'futures trade', 'futures liquidation'];
    const positions = [];
    const router = new LineRouter();

    const dateToCheck = moment.utc('2020-03-29 23:07:09')
    for (let line of lines) {
      // parse Date as UTC
      line.dateTime = moment.utc(line.dateTime);

      let position = router.route(line);
      if (validTypes.includes(line.type)) {
        position.handleLine(line);
      }

      if (position.isComplete()) {
        // Check for position complete and finalize
        if (
          line.dateTime.isAfter(dateToCheck) &&
          line.symbol.slice(0, 2) === 'pi'
        ) {
          continue;
        }

        //position.generatePnl();
        positions.push(position);
        router.finalize(position);
      }
    }

    return positions;
  }
}

class LineRouter {
  positions: { [index: string] : Position };

  constructor() {
    this.positions = {};
  }

  route(line: Line) {
    let position;
    const pair = line.account.slice(2).split(':');
    const base = pair[0] === 'xbt' ? 'btc' : pair[0];
    const quote = pair[1] === 'xbt' ? 'btc' : pair[1];
    const market = base + '/' + quote;
    if (!this.positions[market]) {
      position = new Position();
      this.positions[market] = position;
    } else {
      position = this.positions[market];
    }
    return position;
  }

  finalize(position: Position) {
    var market = position.base + '/' + position.quote;
    this.positions[market] = new Position();
  }
}

export class Position {
  collateralType: string;
  basisTrades: Array<Trade>;
  basisFee: number;
  fundingFee: number;
  pnl: number;
  outstanding: number;
  basisFeeCurrency: string;
  fundingFeeCurrency: string;
  fundingTrades: Array<Trade>;
  settlementTrades: Array<Trade>;
  openPrice: number;
  closePrice: number;
  dateOpen: moment.Moment | null;
  dateClose: moment.Moment | null;
  base: string;
  quote: string;
  exchange: string;

  constructor() {
    this.collateralType = 'crypto';
    this.basisTrades = [];
    this.basisFee = 0.0;
    this.fundingFee = 0.0;
    this.pnl = 0.0;
    this.outstanding = 0.0;
    this.basisFeeCurrency = 'USD';
    this.fundingFeeCurrency = 'USD';
    this.fundingTrades = [];
    this.settlementTrades = [];
    this.outstanding = 0.0;
    this.openPrice = 0.0;
    this.closePrice = 0.0;
    this.dateOpen = null;
    this.dateClose = null;
    this.base = '';
    this.quote = '';
    this.exchange = 'Kraken Futures';
  }

  isComplete() {
    return !this.isEmpty() && this.outstanding == 0.0;
  }

  isEmpty() {
    return this.basisTrades.length == 0;
  }

  handleLine(line: Line) {
    if (this.isEmpty()) {
      let pair = line.account.slice(2).split(':');
      this.base = pair[0];
      this.quote = pair[1];
      this.fundingFeeCurrency = pair[0].toUpperCase();
      if (this.base === 'xbt') this.base = 'btc';
      if (this.quote === 'xbt') this.quote = 'btc';
      this.dateOpen = line.dateTime;
    }

    if (line.symbol.slice(0, 2) === 'pi') {
      this.handleBasisTrade(line);
    } else {
      this.handleFundingTrade(line);
    }

    if (this.isComplete()) {
      this.dateClose = line.dateTime;
    }
  }

  handleBasisTrade(line: Line) {
    this.createBasisTrade(line);

    this.outstanding = parseFloat(line['new balance']);
    this.openPrice = parseFloat(line['new average entry price']);
    this.closePrice = parseFloat(line['trade price'])
  }

  createBasisTrade(line: Line) {
    const price = parseFloat(line['trade price']);
    const trade = {
      tradeId: line.uid,
      dateTime: line.dateTime,
      amount: parseFloat(line.change) / price,
      price: price,
      type: 'future-basis',
      exchange: this.exchange,
      base: this.base,
      quote: this.quote,
    }
    this.basisTrades.push(trade);
  }

  handleFundingTrade(line: Line) {
    var funding = parseFloat(line['realized funding']);
    var pnl = parseFloat(line['realized pnl']);
    var price = parseFloat(line['trade price']);
    var fee = parseFloat(line['fee']);

    if (funding && funding != 0.0) {
      this.fundingFee -= funding;
      this.createFuturesFundingTrade(line);
    }

    // if position open or close trade
    if (line.type !== 'funding rate change') {
      this.basisFee += fee * price;
    }

    // if line is a position close trade
    if (pnl && pnl != 0.0) {
      this.pnl += pnl * price;

      // add compensative exchange trade to Trade db
      this.createSettlementTrade(line);
      //console.log('created compensation trade');
    }
  }

  createSettlementTrade(line: Line) {
    var trade = {
      tradeId: line.uid,
      dateTime: line.dateTime,
      quote: this.quote,
      base: this.base,
      price: parseFloat(line['trade price']),
      amount: parseFloat(line['realized pnl']),
      exchange: this.exchange,
      type: 'future-pnl',	
      comment: 'Compensative trade for futures position',
    };
    this.settlementTrades.push(trade);
  }

  createFuturesFundingTrade(line: Line) {
    var amount = parseFloat(line['realized funding']);
    if (isNaN(amount)) amount = 0;
    var price = parseFloat(line['funding rate']);
    if (isNaN(price)) price = 0;
    var trade = {
      tradeId: line.uid,
      dateTime: line.dateTime,
      quote: this.quote,
      base: this.base,
      amount: -amount,
      price: price,
      type: 'future-funding',	
      exchange: this.exchange,
    };
    this.fundingTrades.push(trade);
  }
}

export interface Trade {
  tradeId: string,
  dateTime: moment.Moment,
  quote: string,
  base: string,
  amount: number,
  price: number,
  type: string,
  exchange: string,
}

