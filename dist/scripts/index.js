import { config } from "./config.js";
const API_KEY = config.APIKEY;
const API_URL = `https://api.nasa.gov/insight_weather/?api_key=${API_KEY}&feedtype=json&ver=1.0`;

// the weather toggle button and the previous weather dashboard container element
const showPreviousWeatherButton = document.querySelector(
  ".show-previous-weather"
);
const showPreviousWeatherDashboard = document.querySelector(
  ".previous-weather"
);

// the main weather dashboard elements

const currentSolElement = document.querySelector("[data-current-sol]");
const currentDateElement = document.querySelector("[data-current-date]");
const currentTempHighElement = document.querySelector(
  "[data-current-temp-high]"
);
const currentTempLowElement = document.querySelector("[data-current-temp-low]");
const windSpeedElement = document.querySelector("[data-wind-speed]");
const windDirectionText = document.querySelector("[data-wind-direction-text]");
const windDirectionArrow = document.querySelector(
  "[data-wind-direction-arrow]"
);

// the unit toggle element
const unitToggle = document.querySelector("[data-unit-toggle]");
const metricRadio = document.getElementById("cel");
const imperialRadio = document.getElementById("fah");

// the previous weather elements at the bottom
const previousSolTemplate = document.querySelector(
  "[data-previous-sol-template]"
);
const previousSolContainer = document.querySelector("[data-previous-sol");

// showing the previous weather dashboard

showPreviousWeatherButton.addEventListener("click", () => {
  showPreviousWeatherDashboard.classList.toggle("show-weather");
});

//fectching weather data from the API and stuff

let selectedSolIndex;

getWeather().then((sols) => {
  selectedSolIndex = sols.length - 1;
  displaySelectedSol(sols);
  displayPreviousSols(sols);
  updateUnits();

  unitToggle.addEventListener("click", () => {
    let metricUnits = !isMetric();
    metricRadio.checked = metricUnits;
    imperialRadio.checked = !metricUnits;
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
  });

  metricRadio.addEventListener("change", () => {
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
  });

  imperialRadio.addEventListener("change", () => {
    displaySelectedSol(sols);
    displayPreviousSols(sols);
    updateUnits();
  });
});

// function to display the current sole the main dashboard

function displaySelectedSol(sols) {
  const selectedSol = sols[selectedSolIndex];
  currentSolElement.textContent = selectedSol.sol;
  currentDateElement.textContent = displayDate(selectedSol.date);
  currentTempHighElement.textContent = displayTemperature(selectedSol.maxTemp);
  currentTempLowElement.textContent = displayTemperature(selectedSol.minTemp);
  windSpeedElement.textContent = displaySpeed(selectedSol.windSpeed);
  windDirectionArrow.style.setProperty(
    "--direction",
    `${selectedSol.windDirectionDegrees}deg`
  );
  windDirectionText.textContent = selectedSol.windDirectionCardinal;
}

// function to display the previous soles
function displayPreviousSols(sols) {
  previousSolContainer.innerHTML = "";
  sols.forEach((solData, index) => {
    // create an HTML element by cloning the pre-created template
    const solContainer = previousSolTemplate.content.cloneNode(true);

    // populate the template with values from the fetch
    solContainer.querySelector("[data-sol]").textContent = solData.sol;
    solContainer.querySelector("[data-date]").textContent = displayDate(
      solData.date
    );
    solContainer.querySelector(
      "[data-temp-high]"
    ).textContent = displayTemperature(solData.maxTemp);
    solContainer.querySelector(
      "[data-temp-low]"
    ).textContent = displayTemperature(solData.minTemp);

    // update the current selected sol and add 'click' listener for all button

    solContainer
      .querySelector("[data-select-button]")
      .addEventListener("click", () => {
        selectedSolIndex = index;
        displaySelectedSol(sols);
      });

    // append previous sols to previous sol container
    previousSolContainer.appendChild(solContainer);
  });
}

// date formatter
function displayDate(date) {
  return date.toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

//temperature formatter
function displayTemperature(temp) {
  let returnTemp = temp;
  if (!isMetric()) {
    returnTemp = (returnTemp * 9) / 5 + 32;
  }
  return Math.round(returnTemp);
}

//speed formatter
function displaySpeed(speed) {
  let returnSpeed = speed;
  if (!isMetric()) {
    returnSpeed = speed / 1.609;
  }
  return Math.round(returnSpeed);
}

// the fetch weather function
function getWeather() {
  return fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      const { sol_keys, validity_checks, ...solData } = data;
      return Object.entries(solData).map(([sol, data]) => {
        return {
          sol: sol,
          maxTemp: data.AT.mx,
          minTemp: data.AT.mn,
          windSpeed: data.HWS.av,
          windDirectionDegrees: data.WD.most_common.compass_degrees,
          windDirectionCardinal: data.WD.most_common.compass_point,
          date: new Date(data.First_UTC),
        };
      });
    });
}

function updateUnits() {
  const speedUnits = document.querySelectorAll("[data-speed-unit]");
  const tempUnits = document.querySelectorAll("[data-temp-unit]");
  speedUnits.forEach((unit) => {
    unit.innerText = isMetric() ? "kph" : "mph";
  });

  tempUnits.forEach((unit) => {
    unit.innerText = isMetric() ? "C" : "F";
  });
}

function isMetric() {
  return metricRadio.checked;
}
