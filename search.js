import  fetchNews  from "./js/fetchnews.js";
import NewsApiParams,{buildQueryString} from './js/newsapiparams.js'


document.addEventListener('DOMContentLoaded',()=>{
    //global var
    let params = new NewsApiParams() ;
    params.q =   new URLSearchParams(window.location.search);

    const searchBox = document.querySelector('#search');
    searchBox.placeholder = params.q;
    updateSearchResults(buildQueryString(params));


    function updatePagenation(){
        const pagenation = document.querySelector('.pagenation');
        pagenation.style.display = "flex";
        const currentPage = document.querySelector(`#page-${params.page}`);        
        currentPage.style.backgroundColor = "#464646";
        currentPage.style.color = "white";
    }

    async function updateSearchResults(searchString) {
        
        const newsData = await fetchNews("everything",searchString);
        console.log(newsData);
        
        const mainContainer = document.querySelector('#search-news-container');
        const templateNewsCard = document.querySelector('#card-concept3');
        mainContainer.innerHTML = "";

        newsData.forEach(article => {
            if(article.title === "[Removed]" || article.description === "[Removed]"){
                return;
            }
            
            const cardClone =  templateNewsCard.content.cloneNode(true); 
            bindNewsToCard(cardClone,article);
            mainContainer.append(cardClone);     
        });  
        updatePagenation();
    }
    function bindNewsToCard(cardClone,article){
        // console.log(article);
        const link = cardClone.querySelector('.news');
        const heading = cardClone.querySelector('.heading');
        const descripiton = cardClone.querySelector('.description');
        const author = cardClone.querySelector('.author');
        const source = cardClone.querySelector('.source');
        const img = cardClone.querySelector('#img')
        link.href = article.url;
        heading.innerHTML = article.title;
        descripiton.innerHTML = article.description.slice(0,200)+"..."  ;
        author.innerHTML = article.author;
        source.innerHTML = article.source.name;
        img.src = article.urlToImage;
    }

    const searcBtn = document.querySelector('#search-btn');
    searcBtn.addEventListener('click',() =>{
        const querie = searchBox.value ;
        params.q = querie ;
        updateSearchResults(buildQueryString(params))
    });

    const sortBy = document.querySelector('#sortBy');
    sortBy.addEventListener('click',(event) => {
        if(params.q != ''){
            params.sortBy = event.target.value;
            updateSearchResults(buildQueryString(params));      
        }
    });

    const lang = document.querySelector('#language-field');
    const langOptions = ["en","es"]
    lang.addEventListener('click',() => {
        if(params.q != ''){
            params.language = langOptions[lang.selectedIndex];            
            updateSearchResults(buildQueryString(params));  
        }
    });

    const prev = document.querySelector('#prev');
    prev.addEventListener( 'click' ,() => {
        if(params.page > 1 ){

            const currentPage = document.querySelector(`#page-${params.page}`);      

            params.page = params.page - 1;
            updateSearchResults(buildQueryString(params));

            currentPage.style.backgroundColor = "#f0f0f0";
            currentPage.style.color = "rgb(46, 46, 46)";
        }
    });

    const next = document.querySelector('#next');
    next.addEventListener('click',() => {
        if(params.page < 10){
            
            document.querySelector(`#page-${params.page}`).classList.add('pageInactiveColor');

            params.page = params.page + 1;
            document.querySelector(`#page-${params.page}`).classList.add('pageActiveColor');

            console.log(buildQueryString(params));
            
            updateSearchResults(buildQueryString(params));

        }
    });
    
    document.querySelector('#next').addEventListener('click',() => {
        document.querySelector('.page-header').scrollIntoView({behavior:"smooth"});
    });

});
