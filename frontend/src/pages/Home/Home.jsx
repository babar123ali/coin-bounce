import { useState, useEffect } from 'react';
import { getNews } from '../../api/external';
import styles from './Home.module.css';
import Loader from '../../component/Loader/Loader';
function Home() {

    const [articles, setArticles] = useState([]);

    useEffect(() => {
        (async function newsApiCall() {
            const response = await getNews();
            setArticles(response);
        })();

        //cleanup function
        setArticles([]);
    }, []) 

    const handleCardClick = (url) => {
        window.open(url , 'blank');
    };

    if(articles.length === 0 ){
        return < Loader text="homepage"/>
    }

    return (
        <>
            <div className={styles.header}>Latest Artciles</div>
            <div className={styles.grid}>
                {articles.map((article) => (
                    <div 
                    className={styles.card} 
                    key={article.url}
                    onClick={() => handleCardClick(article.url)}
                    >
                        <img src={article.urlToImage} alt='' />
                        <h3>{article.title}</h3>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Home;
