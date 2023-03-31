import styles from '@/app/page.module.scss'
import githubIcon from '@/public/github-logo.svg';
import krakenIcon from '@/public/kraken.svg';
import Image from 'next/image';

const Header = function({
  className
} : {
  className: string
}) {
  return (
    <div className={styles.app__container__header}>
      <div className={styles.app__container__header__logo}>
        <Image
          src={krakenIcon}
          alt='Kraken'
        />
        <span>Kraken Futures Tax</span>
      </div>
      <form
        className={styles.app__container__header__github}
        action='https://github.com/alexkonsta93/krakenfuturestax.git' method='get' target='_blank'>
        <button
          type='submit'>
            <Image
              src={githubIcon}
              alt='Github'
            />
          Github
        </button>
      </form>
    </div>
  );
};

export default Header;
