"use strict";

const btn = document.querySelector(".btn-country");
const countriesContainer = document.querySelector(".countries");

const renderCountry = function (data, className = "") {
  const currencyKey = Object.keys(data.currencies)[0];
  const currency = data.currencies[currencyKey].name;

  const languageKey = Object.keys(data.languages)[0];
  const language = data.languages[languageKey];

  const html = `
    <article class="country ${className}">
        <img class="country__img" src="${data.flags["svg"]}" />
        <div class="country__data">
          <h3 class="country__name">${data.name.common}</h3>
          <h4 class="country__region">${data.region}</h4>
          <p class="country__row"><span>👫</span>${(
            +data.population / 1000000
          ).toFixed(1)} M people</p>
          <p class="country__row"><span>🗣️</span>${language}</p>
          <p class="country__row"><span>💰</span>${currency}</p>
        </div>
    </article>`;

  countriesContainer.insertAdjacentHTML("beforeend", html);
  countriesContainer.style.opacity = 1;
};

const renderError = function (msg) {
  countriesContainer.insertAdjacentText("beforeend", msg);
  countriesContainer.style.opacity = 1;
};

const getJSON = function (url, errorMsg = "Something went wrong") {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`${errorMsg} (${response.status})`);
    }

    return response.json();
  });
};

// Async Await
const getPosition = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });
};

const whereAmI = async function () {
  try {
    // Geolocation
    const pos = await getPosition();
    const { latitude: lat, longitude: lng } = pos.coords;

    // Reverse geocoding
    const resGeo = await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`);
    if (!resGeo.ok) throw new Error("Problem getting location data");
    const dataGeo = await resGeo.json();

    // fetch(`https://restcountries.com/v3.1/name/${country}`).then((res) =>
    //   console.log(res)
    // );
    const res = await fetch(
      `https://restcountries.com/v3.1/name/${dataGeo.country}`
    );
    if (!res.ok) throw new Error("Problem getting country");

    const data = await res.json();
    renderCountry(data[0]);

    const neighbourCode = data[0].hasOwnProperty("borders")
      ? data[0].borders[0]
      : false;
    if (!neighbourCode) throw new Error("No neighbour found!");

    const neighbour = await fetch(
      `https://restcountries.com/v3.1/alpha/${neighbourCode}`
    );
    if (!res.ok) throw new Error("Problem getting country");
    const neighbourData = await neighbour.json();

    renderCountry(neighbourData[0], "neighbour");

    btn.style.opacity = 0;

    return `You are in ${dataGeo.city}, ${dataGeo.country}`;
  } catch (err) {
    console.error(`${err} !!!!!`);
    renderError(`${err.message}`);

    // Reject promise returned from async function
    throw err;
  }
};
btn.addEventListener("click", whereAmI);
