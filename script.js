const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initially vairables needed??

 let currentTab = userTab;
//  stores the tb on which we are currently by default it stays on the user tab

const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
// used to authenticate while using the weather API

currentTab.classList.add("current-tab"); 
// used to add the greyish background on the current selected tab

getfromSessionStorage();
// to check initially if the coordinates are present 

function switchTabs(clickedTab){
     if(clickedTab != currentTab){
         currentTab .classList.remove("current-tab");
         currentTab = clickedTab;
         currentTab.classList.add("current-tab");
         // to make the greyish background appear now on the new current tab

         if(!searchForm.classList.contains("active")){
            // if active is present in the classlist then we are going to the usertab and if it is absent then it means that we need to go to the search tab

            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active"); 
            // hide the other 2 screens and make the search form visible 
         }
         else{
            // this means we were earlier in the search rab and now we want to make the user tab visible

            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");

            // now we are in your weather tab and we need to display the weather so we need to ckeck the local storage first for the coordination of your location
            getfromSessionStorage();
         }
     }
     else{
        return;
     }
}

 userTab.addEventListener('click',()=>{
    // pass clicked tab as input parameter
    switchTabs(userTab);
 })

  searchTab.addEventListener('click',()=>{
    // pass clicked tab as input parameter
    switchTabs(searchTab);
 })

//  check if coordination of your location are stored in the local storage
function getfromSessionStorage(){
     const localCoordinates = sessionStorage.getItem("user-coordinates");
     if(!localCoordinates){
        // if local coordinates are not found
        grantAccessContainer.classList.add("active");
     }
     else{
        // if local coordinates are found
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
     }
}

 async function fetchUserWeatherInfo(coordinates){
    const{lat,lon} = coordinates;
    // make grantascesscontainer invisible
    grantAccessContainer.classList.remove("active");

    // make loader visible
    loadingScreen.classList.add("active");

    // API call
    try{
      const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
          );

      // convert the fetched data into json format
      // use await to wait until the data is converted
      const data = await response.json();

      // run the api key on google(convert to json then) for a demo city to check what all outputs are we getting from the api response so we can fetch the required details

      // now since data is available remove the loaading screen 

      loadingScreen.classList.remove("active");

      // now make the data visible
      userInfoContainer.classList.add("active");

      // now add values to the UI  dynamically 
      renderWeatherInfo(data);
    }
    catch(err){
       loadingScreen.classList.remove("active");
       // hw what to do next
    }
}

// responsible for updating the UI
function renderWeatherInfo(weatherInfo){
     // firstly we have to fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch info from weatherinfo and put values in UI element
    // optional chaining operator (?)
    // run the api on google with random values and then use online json formatter to see the exact location where the info we need is stored

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    //  we have used a cdn link to fetch the flag 
    // see the part in curly brackets

    desc.innerText = weatherInfo?.weather?.[0]?.description;
    // since weather is an array we need to ascess its first element

    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    //  we have used a cdn link to fetch the icon
    // see the part in curly brackets

    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    //  we used backticks to add the degree symbol after the temp

    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
     // add m/s

    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
   //  add %

    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
   //  add %
}

function getLocation(){
   if(navigator.geolocation){
      // checks whether the brwoser supports geolocation or not
      navigator.geolocation.getCurrentPosition(showPosition);
      // showposition is a callback function
   }
   else{
      alert("Geolocation is not supported by your browser. Please use search instead.");
   }
}

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    // see w3school geolocation navigator theory

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener('click',getLocation)

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    // firstly deletes the default action

    let cityName = searchInput.value;

    if(cityName === ""){
      return;
    }
    else{
      fetchSearchWeatherInfo(cityName);
      // fetches the data for that cityname
    }
})

async function fetchSearchWeatherInfo(city){
   loadingScreen.classList.add("active");
   userInfoContainer.classList.remove("active");
   grantAccessContainer.classList.remove("active");

   // now we need to call the API
   try{
      const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
          );

      // throw error if the city is not found
      if(!response.ok){
         throw new Error("City not found");
      }

      const data = await response.json();

      // now remove the loading screen
      loadingScreen.classList.remove("active");
      userInfoContainer.classList.add("active");
      renderWeatherInfo(data);
   }
   catch(err){
      // if you dont catch it it will just show a white screen;
     loadingScreen.classList.remove("active");
     alert("Couldn't find that city. Please check the spelling and try again.");
   }
}

