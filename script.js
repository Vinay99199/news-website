 import fetchNews  from "./js/fetchnews.js";  
 import getUserData from './js/fetchuserdata.js'
 import NewsApiParams,{buildQueryString} from './js/newsapiparams.js'


    //Selectors

    const day = document.querySelector('#day');
    const location = document.querySelector('#Location');
    const temperature = document.querySelector('#temperature');
    const wdescription = document.querySelector('#W-descripiton');

    const searchBtn = document.querySelector('.search-button');
    const searchBar = document.querySelector('#search');

    //Functions
    function updateDate(){
        const date = new Date();
        const weekdays = ["Sunday","Monday", "Tuesday","Wednesday","Thursday","Friday","Saturday"] ; 
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        day.innerHTML =`${weekdays[date.getDay()]} , ${date.getDate()} ${months[date.getMonth()]} , ${date.getFullYear()}`;

    }

    function updateWeatherSection(locationData,weatherData){
        updateDate();
        location.innerHTML = locationData;
        const temp =  weatherData.main.temp - 273.15; //Kelvin to celsius
        temperature.innerHTML = `${((temp * 9/5) + 32).toFixed(2)}°F / ${temp.toFixed(2)}°C` ;
        wdescription.innerHTML = weatherData.weather[0].description;
        console.log(weatherData.weather[0].description);
    }

    async function getWeather(){

        const data = await getUserData();

        const [latitude,longitude] = data.loc.split(",");
        const key = "a2847ebdcdfe3330a2ba9240b8998bcd";
        let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;
        
        try {
            const weatherApiResponse = await fetch(url);
            if(weatherApiResponse.ok){
                const weatherData = await weatherApiResponse.json();
                updateWeatherSection(data.city,weatherData);
            }
            else{
                throw new error("Failed to fetch weather data");
            }
        }
        catch(error){
            console.error("there was an error",error);          
        }

    }


    

    async function updateNewsHeadlines(){
        const newsArticles = await fetchNews("topheadline")
        const topNewsContainer = document.querySelector('.other-news');
        const templateNewsCard = document.querySelector('#template-news-card');
        const AsideNewsConatainer = document.querySelector('.latest-news-container');
        const templateAsideCard = document.querySelector('.template-aside-news-card');

        topNewsContainer.innerHTML = " ";

        let newsDisplayed = 0;
        newsArticles.forEach(article => {
            if(article.urlToImage == null || newsDisplayed > 12) return;
            newsDisplayed++;
            if(newsDisplayed == 1){
                const link = document.querySelector('.heading');
                const headlineImg = document.querySelector('#headline-img');
                const headlineTitle = document.querySelector('#headline-title');
                const descripiton = document.querySelector('.newsDescription');
                const author = document.querySelector('.author');
                link.href = article.url;
                headlineImg.src = article.urlToImage;
                headlineTitle.innerHTML = article.title;
                descripiton.innerHTML = article.description.slice(0,20);
                
                author.innerHTML = article.author; 

            }
            else if(newsDisplayed < 8){   
                const cardClone = templateNewsCard.content.cloneNode(true);         
                bindNewsToCard(cardClone,article);
                topNewsContainer.append(cardClone);
            }
            else{
                const asideCardClone = templateAsideCard.content.cloneNode(true);
                bindNewsToAsideCard(asideCardClone,article);
                AsideNewsConatainer.append(asideCardClone);
                
            }

        });
    }

    function getTime(time){
        const newsTime = new Date(time);
        const currentTime = new Date();

        const timeDifference = currentTime - newsTime;

        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
        return  (hours>24)?`${hours/24} ago` : `${hours} hrs ago`;
    }

    function bindNewsToCard(cardClone,article,concept){
        const newsLink = cardClone.querySelector('.top-news')
        const newsImg = cardClone.querySelector('#news-img');
        const newsTitle = cardClone.querySelector('#news-title');
        const source = cardClone.querySelector('#source');

        if (concept == 3){
            const description = cardClone.querySelector('.newsDescription');
            const time = cardClone.querySelector('#time');            

            description.innerHTML = article.content;
            time.innerHTML = getTime(article.publishedAt);
            
        }

        newsLink.href = article.url;
        source.innerHTML = article.source.name;
        newsImg.src = article.urlToImage;
        updateTitles(newsTitle,article.title);
    }

    function bindNewsToAsideCard(cardClone,article){
        const newsLink = cardClone.querySelector('.aside-news-card')
        const newsAuthor= cardClone.querySelector('#aside-author');
        const newsTitle = cardClone.querySelector('.aside-news-title');
        const time = cardClone.querySelector('#time-holder');
        const timeString = article.publishedAt;
        time.innerHTML = timeString.substring(timeString.indexOf('T')+1,timeString.indexOf('T')+6);
        newsLink.href = article.url;
        newsAuthor.innerHTML = article.author;
        updateTitles(newsTitle,article.title)

        
    }
    function updateTitles(newsTitle,title){
        if (title) {
            const lastDashIndex = title.lastIndexOf('-');
            newsTitle.innerHTML = lastDashIndex !== -1 
                ? title.substring(0, lastDashIndex) 
                : title; 
        } else {
            newsTitle.innerHTML = "No title available"; // Fallback if title is missing
        }
    }

    async function updateWeekendReads(){
        const params = new NewsApiParams();
        params.q = "future technology";
        params.domains = "bbc.com,cnn.com";
        params.pageSize = 2;
        const searchString = buildQueryString(params);
        const articles = await fetchNews("everything",searchString);

        const container = document.querySelector('.weekend-reads-container');

        articles.forEach(article => {

            const templateNewsCard = document.querySelector('.card-concept-3');
            const cardClone = templateNewsCard.content.cloneNode(true);         
            bindNewsToCard(cardClone,article,3);
            container.append(cardClone);

        });

        // function bindNewsToConceptCard(cardClone,article){
        //     const newsLink = cardClone.querySelector('.top-news')
        //     const newsImg = cardClone.querySelector('#news-img');
        //     const newsTitle = cardClone.querySelector('#news-title');
        //     const source = cardClone.querySelector('#source');
    
    
        //     newsLink.href = article.url;
        //     source.innerHTML = article.source.name;
        //     newsImg.src = article.urlToImage;
        //     updateTitles(newsTitle,article.title);
        // }



        console.log(searchString);
        console.log(articles);
        
    }

    
    getWeather();
    updateNewsHeadlines();
    updateWeekendReads();

    searchBtn.addEventListener('click', () => {
        const query = searchBar.value.trim();
        if (query) {
            // Redirect to search.html with the query as a URL parameter
            window.location.href = `search.html?query=${encodeURIComponent(query)}`;
        }        
    });

document.addEventListener('DOMContentLoaded',() => {

    const links = document.querySelectorAll('a');
console.log(links);
    
    links.forEach(link => {
        console.log(link);
        link.addEventListener('click',(e)=>{
            e.preventDefault();
            console.log(e);
            
        });
    })

}); 



    // // let url = "https://newsapi.org/v2/everything?q=keyword&apiKey=e5d67e6950b846c8a4e26bb32d67afb4";
    // let url = "https://newsapi.org/v2/top-headlines?country=us&apiKey=e5d67e6950b846c8a4e26bb32d67afb4";


// function updateNewsHeadlines(newsData){
//     console.log(newsData.articles[0]);
//     const headingLink = document.createElement('a').classList.add('newslink');
//     headingLink.href = newsData.articles[0].url;
    
//     const figure = document.createElement('figure');
//     const img = document.createElement('img');
//     img.src = newsData.articles[0].urlToImage;
//     figure.appendChild(img);
//     const heading = document.createElement('h2');
//     heading.textContent = newsData.articles[0].title;
//     const para = document.createElement('p').classList.add('newsDescription');
//     const writtenBy = document.createElement('p').classList.ass('wrttenBy');
//     const span = document.createElement('span').classList.add('author');

//     writtenBy.appendChild(span);

//     headingLink.appendChild(figure);
//     headingLink.appendChild(document.createElement('br'));
//     headingLink.appendChild(heading);
//     headingLink.appendChild(document.createElement('br'));
//     headingLink.appendChild(para)
//     headingLink.appendChild(document.createElement('br'));
//     headingLink.appendChild(writtenBy);

//     const section = document.querySelector('.headline-section');
//     section.appendChild(headingLink);

// }