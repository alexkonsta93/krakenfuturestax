'use client';
import styles from '@/app/page.module.scss';
import type { RootState } from '@/store/store';
import FileSaver from 'file-saver';
import type { Trade } from '@/app/KrakenFuturesAdapter';
import { Position } from '@/app/KrakenFuturesAdapter';
import { useAppSelector } from '@/store/store';
import Papa from 'papaparse';

function tradeToObj(trade: Trade) {
  let buyAmount, buyCurrency, sellAmount, sellCurrency;
  if (trade.amount > 0) {
    buyAmount = trade.amount;
    buyCurrency = trade.base;
    sellAmount = trade.amount * trade.price;
    sellCurrency = trade.quote;
  } else {
    buyAmount = -trade.amount * trade.price;
    buyCurrency = trade.quote;
    sellAmount = -trade.amount;
    sellCurrency = trade.base;
  }
  return {
    'Type': 'Trade',
    'BuyAmount': buyAmount,
    'BuyCurrency': buyCurrency,
    'SellAmount': sellAmount,
    'SellCurrency': sellCurrency,
    'FeeAmount': 0,
    'FeeCurrency': 'USD',
    'Exchange': 'Kraken Futures',
    'Group': null,
    'Date': trade.dateTime
  }
}

function createBlob(data: string) {
  return new Blob([data], { type: 'text/plain' });
}

const DownloadSettlementsBtn = function({
  positions
} : {
  positions: Position[]
}) {
  let settlements: Trade[] = [];
  positions.forEach((position) => {
    settlements = settlements.concat(position.settlementTrades);
  })
  const csv = Papa.unparse(settlements.map(settlement => tradeToObj(settlement), {
    header: true
  }));

  const downloadSettlements = function() {
    const file = createBlob(csv);
    FileSaver.saveAs(file, 'settlements.csv');
  }

  return (
    <div className={styles.app__container__download_button}>
      <button
        onClick={() => downloadSettlements()}
      >
        Download Settlements
      </button>
    </div>
  )
}

type PositionObject = {
  [index: string]: string | number | null;
}

function positionToObj(position: Position) {
  return({
    'Exchange': position.exchange,
    'Date Open': position.dateOpen ? position.dateOpen.format() : null,
    'Date Close': position.dateClose ? position.dateClose.format() : null,
    'Base': position.base,
    'Quote': position.quote,
    'Open Price': position.openPrice,
    'Close Price': position.closePrice,
    'Basis Fee': position.basisFee,
    'Basis Fee Currency': position.basisFeeCurrency,
    'Funding Fee': position.fundingFee,
    'Funding Fee Currency': position.fundingFeeCurrency,
    'Net PnL': position.pnl
  });
}

const DownloadSummaryBtn = function({
  positions
} : {
  positions: Position[]
}) {
  let positionObjects: PositionObject[] = [];
  positions.map(position => positionObjects.push(positionToObj(position)));
  const csv = Papa.unparse(positionObjects, {
    header: true
  })

  const downloadSummaries = function() {
    const file = createBlob(csv);
    FileSaver.saveAs(file, 'positions.csv');
  }
  return (
    <div className={styles.app__container__download_button}>
      <button
        onClick={() => downloadSummaries()} 
      >
        Download Positions
      </button>
    </div>
  )
}

const Download = function({
  className
} : {
  className: string
}) {
  const selectPositions = (state : RootState) => state.positions
  const positions  = useAppSelector(selectPositions).positions;
  return (
    <div className={styles.app__container__download}>
      <DownloadSummaryBtn positions={positions}/>
      <DownloadSettlementsBtn positions={positions}/>
    </div>
  )
}

export default Download;
