'use client'
import styles from './page.module.scss'
import Header from '@/app/Header';
import Main from '@/app/Main';
import Download from '@/app/Download';
import Upload from '@/app/Upload';
import store from '@/store/store'
import { Provider } from 'react-redux';

export default function App() {
  return (
    <Provider store={store}>
      <main className={styles.app__container}>
        <Header className={styles.app__container__header} />
        <Upload className={styles.app__container__upload} />
        <Main className={styles.app__container__main} />
        <Download className={styles.app__container__download} />
      </main>
    </Provider>
  )
}
