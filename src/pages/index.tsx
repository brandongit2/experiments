import Head from 'next/head';

import styles from './index.modules.scss';

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Experiments</title>
            </Head>
            <h1>Experiments</h1>
        </div>
    );
}
