import styles from '@/app/page.module.scss'

const Header = function({
  className
} : {
  className: string
}) {
  return (
    <div className={styles.app__container__header}>
      <div className={styles.app__container__header__logo}><h2>Kraken Futures Taxes</h2></div>
      <button id={styles.app__container__header__button}>
        Report Issue
      </button>
    </div>
  );
};

export default Header;
