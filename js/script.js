const apiKey = "fa6bf441eac2e36f5854c2faca637d41"; // Reemplaza con tu API Key
const cityInput = document.getElementById("cityInput");
const getWeatherButton = document.getElementById("getWeather");
const weatherBanner = document.querySelector(".slide .content");
const citiesContainer = document.getElementById("citiesContainer"); // Contenedor para las tarjetas de ciudades predeterminadas

// Obtener el array de ciudades desde Local Storage o usar ciudades predeterminadas
const storedCities = JSON.parse(localStorage.getItem("cities")) || [
  "Guaymas",
  "Russia",
  "Navojoa",
  "Hermosillo",
  "San luis potosí",
  "Veracruz",
];

// Función para encontrar la ciudad más caliente
function displayHottestCity() {
  let hottestCity = null;
  let maxTemp = -Infinity;

  // Promesas para obtener los datos de clima de todas las ciudades
  const weatherPromises = storedCities.map((city) => fetchWeather(city));

  Promise.all(weatherPromises).then((weatherDataArray) => {
    weatherDataArray.forEach((weatherData) => {
      if (weatherData && parseFloat(weatherData.temperature) > maxTemp) {
        maxTemp = parseFloat(weatherData.temperature);
        hottestCity = weatherData;
      }
    });

    if (hottestCity) {
      // Mostrar la ciudad más caliente en el banner
      document.getElementById("hottestCityName").innerText =
        hottestCity.cityName;
      document.getElementById(
        "hottestCityTemp"
      ).innerText = `Temperatura: ${hottestCity.temperature}°C`;
      document.getElementById("hottestCityIcon").src =
        hottestCity.conditionIcon;
    } else {
      console.log("No se pudo determinar la ciudad más caliente.");
    }
  });
}

// Función para obtener el clima de una ciudad
function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=es`;

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // OpenWeatherMap usa una estructura diferente, ajustamos para obtener los datos correctos
      const cityName = `${data.name}, ${data.sys.country}`; // Nombre de la ciudad y el país
      const temperature = `${data.main.temp} °C`; // Temperatura en grados Celsius
      const condition = data.weather[0].description; // Condición del clima (ej. "clear sky")
      const conditionIcon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`; // Ícono del clima
      const humidity = `${data.main.humidity}%`; // Humedad
      const wind = `${data.wind.speed} kph`; // Velocidad del viento
      const feelsLike = `${data.main.feels_like} °C`; // Sensación térmica

      return {
        cityName,
        temperature,
        condition,
        conditionIcon,
        humidity,
        wind,
        feelsLike,
      };
    })
    .catch((error) => {
      console.error("Error al obtener el clima:", error);
      return null; // En caso de error
    });
}

// Función para renderizar una tarjeta con los datos del clima
function renderWeatherCard(weatherData) {
  if (!weatherData) return; // Si no hay datos, no renderizamos nada

  const card = document.createElement("div");
  card.classList.add("weather-card");

  // Crear el contenido de la tarjeta
  card.innerHTML = `
        <div class="front">
            <h2>${weatherData.cityName}</h2>
            <p class="temp">${weatherData.temperature}</p>
            <div class="condition">
                <img src="${weatherData.conditionIcon}" alt="Icono del clima">
                <p class="cielo">${weatherData.condition}</p>
            </div>
            <div class="details">
                <p><strong>Sensación:</strong> ${weatherData.feelsLike}</p>
                <p><strong>Humedad:</strong> ${weatherData.humidity}</p>
                <p><strong>Viento:</strong> ${weatherData.wind}</p>
            </div>
        </div>
        <div class="back">
            <h2>Opciones</h2>
            <button class="delete-btn">Eliminar</button>
        </div>
    `;

  // Evento para voltear la tarjeta al pasar el mouse
  card.addEventListener("mouseenter", function () {
    card.classList.add("flipped"); 
  });

  card.addEventListener("mouseleave", function () {
    card.classList.remove("flipped"); 
  });

  // Manejar el evento de clic en el botón "Eliminar"
  card.querySelector(".delete-btn").addEventListener("click", function () {
    // Obtener solo el nombre de la ciudad (eliminar el país y asegurarse de que coincida sin importar mayúsculas/minúsculas)
    const cityName = weatherData.cityName.split(",")[0].trim().toLowerCase(); 
    const index = storedCities.findIndex(
      (city) => city.trim().toLowerCase() === cityName
    ); // Buscar el índice de la ciudad sin importar mayúsculas/minúsculas

    if (index > -1) {
      storedCities.splice(index, 1); // Eliminar la ciudad del array
      localStorage.setItem("cities", JSON.stringify(storedCities)); // Actualizar Local Storage
      citiesContainer.removeChild(card); // Eliminar la tarjeta del DOM
      window.location.reload();
    } else {
      console.error("Ciudad no encontrada:", cityName); // Para depurar si no coincide
    }
  });

  // Añadir la tarjeta al contenedor de ciudades
  citiesContainer.appendChild(card);
}

// Obtener y mostrar el clima para las ciudades del Local Storage
const weatherCards = [];

// Obtener y mostrar el clima para las ciudades del Local Storage en orden alfabético
storedCities
  .sort((a, b) => a.localeCompare(b))
  .forEach((city) => {
    fetchWeather(city).then((weatherData) => {
      // Agregar la tarjeta al array temporal en lugar de agregarla directamente al DOM
      weatherCards.push(weatherData);

      // Una vez que todas las tarjetas están en el array, renderizarlas en el orden correcto
      if (weatherCards.length === storedCities.length) {
        // Ordenar las tarjetas por el nombre de la ciudad
        weatherCards.sort((a, b) => a.cityName.localeCompare(b.cityName));

        // Renderizar todas las tarjetas en el contenedor de ciudades
        weatherCards.forEach((weatherData) => renderWeatherCard(weatherData));
      }
    });
  });

// Al hacer clic en el botón de "Buscar"
getWeatherButton.addEventListener("click", function () {
  const city = cityInput.value;
  if (city) {
    fetchWeather(city).then((weatherData) => {
      // Actualizar el banner
      weatherBanner.innerHTML = `
                <div class="weather-info">
                    <h1>${weatherData.cityName}</h1>
                    <p class="temp">${weatherData.temperature}</p>
                    <div class="condition">
                        <img src="${weatherData.conditionIcon}" alt="Icono del clima">
                        <p>${weatherData.condition}</p>
                    </div>
                    <div class="details">
                        <div>
                            <p class="label">Sensación:</p>
                            <p>${weatherData.feelsLike}</p>
                        </div>
                        <div>
                            <p class="label">Humedad:</p>
                            <p>${weatherData.humidity}</p>
                        </div>
                        <div>
                            <p class="label">Viento:</p>
                            <p>${weatherData.wind}</p>
                        </div>
                    </div>
                    <button class="change-city-btn" id="changeCityBtn">Cambiar Ciudad</button>
                </div>
            `;

      // Evento para el botón "Cambiar Ciudad"
      document
        .getElementById("changeCityBtn")
        .addEventListener("click", function () {
          localStorage.removeItem("city"); // Eliminar la ciudad del localStorage
          window.location.reload(); // Recargar la página para buscar una nueva ciudad
        });
    });
    localStorage.setItem("city", city); // Guardar la ciudad en LocalStorage
  } else {
    alert("Por favor, ingresa una ciudad.");
  }
});

// Al cargar la página, verificar si hay una ciudad guardada en LocalStorage
document.addEventListener("DOMContentLoaded", function () {
  displayHottestCity();
  const savedCity = localStorage.getItem("city");
  if (savedCity) {
    fetchWeather(savedCity).then((weatherData) => {
      // Actualizar el banner
      weatherBanner.innerHTML = `
                <div class="weather-info">
                    <h1>${weatherData.cityName}</h1>
                    <p class="temp">${weatherData.temperature}</p>
                    <div class="condition">
                        <img src="${weatherData.conditionIcon}" alt="Icono del clima">
                        <p>${weatherData.condition}</p>
                    </div>
                    <div class="details">
                        <div>
                            <p class="label">Sensación:</p>
                            <p>${weatherData.feelsLike}</p>
                        </div>
                        <div>
                            <p class="label">Humedad:</p>
                            <p>${weatherData.humidity}</p>
                        </div>
                        <div>
                            <p class="label">Viento:</p>
                            <p>${weatherData.wind}</p>
                        </div>
                    </div>
                    <button class="change-city-btn" id="changeCityBtn">Cambiar Ciudad</button>
                </div>
            `;

      // Evento para el botón "Cambiar Ciudad"
      document
        .getElementById("changeCityBtn")
        .addEventListener("click", function () {
          localStorage.removeItem("city"); // Eliminar la ciudad del localStorage
          window.location.reload(); // Recargar la página para buscar una nueva ciudad
        });
    });
  }
});

// Funcionalidad de la Modal
const abrirModalButton = document.getElementById("abrirModal");
const addCityModal = document.getElementById("addCityModal");
const closeModalButton = document.getElementById("closeModal");
const newCityInput = document.getElementById("newCityInput");
const submitCityButton = document.getElementById("submitCity");

// Al hacer clic en el botón "Agregar Ciudad"
abrirModalButton.addEventListener("click", function () {
  addCityModal.style.display = "block"; // Muestra la modal
});

// Al hacer clic en el botón de cerrar
closeModalButton.addEventListener("click", function () {
  addCityModal.style.display = "none"; // Cierra la modal
});

// Al hacer clic fuera de la modal
window.addEventListener("click", function (event) {
  if (event.target === addCityModal) {
    addCityModal.style.display = "none"; // Cierra la modal
  }
});

// Agregar nueva ciudad
submitCityButton.addEventListener("click", function () {
  const newCity = newCityInput.value.trim(); // Obtener la ciudad ingresada
  if (newCity) {
    fetchWeather(newCity).then((weatherData) => {
      if (weatherData) {
        renderWeatherCard(weatherData); // Renderiza la nueva tarjeta

        storedCities.push(weatherData.cityName.split(",")[0].trim()); // Guarda solo el nombre de la ciudad
        localStorage.setItem("cities", JSON.stringify(storedCities));

        // Limpiar el input y cerrar la modal
        newCityInput.value = "";
        addCityModal.style.display = "none";
        window.location.reload();
      } else {
        alert("No se pudo obtener el clima para la ciudad ingresada.");
      }
    });
  } else {
    alert("Por favor, ingresa una ciudad.");
  }
});
