'use client'
import { useAppSelector } from '@/store/store';
import type { RootState } from '@/store/store';
import { Position } from '@/app/KrakenFuturesAdapter';
import styles from '@/app/page.module.scss';

const ProfitBubble = function({
  className,
  position,
} : {
  className: string,
  position: Position
  }) {
  return (
    <div className={className}>
      <p>{position.pnl > 0 ? 'Profit:' : 'Loss:'} ${position.pnl}</p>
    </div>
  )
}
const BasisBubble = function({
  className,
  position,
} : {
  className: string,
  position: Position,
}) {
  const trades = position.basisTrades;
  return (
    <div className={className}>
      {trades.map((trade, index) => {
        return (
          <div key={index}>
            <p>{trade.amount > 0 ? 'Bought' : 'Sold'} {Math.abs(trade.amount)} {trade.base} on {trade.dateTime.format()}</p>
          </div>
        )
      })
        
      }
    </div>
  );
}

const Main = function({
  className 
} : { 
  className: string 
}) {
  const selectPositions = (state : RootState) => state.positions
  const positions  = useAppSelector(selectPositions).positions;
  return (
    <div className={className}>
      {positions.map((position, index) => {
        return (
          <div key={index}>
            <BasisBubble
              className={styles.app__container__main__basisBubble}
              position={position}
            />
            <ProfitBubble
              className={position.pnl > 0 ? styles.app__container__main__profitBubble : styles.app__container__main__lossBubble}
              position={position}
            />
          </div>
        )
      })}
    </div>
  );
};

export default Main;
      /*
      */
