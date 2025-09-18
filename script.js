const WEATHER_API_KEY = "d77dbc9c66952dae67f86c58ab653dec";
const TOMTOM_API_KEY = "AnWOBls5vLcwsWYRDnxX8Qf2UKPKHkHb";

// Barangays grouped West, Center, East with coordinates
const barangays = {
  west: [
    { name: "Añato", lat: 13.95, lon: 121.70 },
    { name: "Alupaye", lat: 13.94, lon: 121.68 },
    { name: "Antipolo", lat: 13.96, lon: 121.69 },
    { name: "Bagumbungan Iba.", lat: 13.93, lon: 121.71 },
    { name: "Bagumbungan Ila.", lat: 13.93, lon: 121.72 },
    { name: "Bantigue", lat: 13.95, lon: 121.71 },
    { name: "Bigo", lat: 13.97, lon: 121.70 },
    { name: "Binahaan", lat: 13.96, lon: 121.72 },
    { name: "Bukal", lat: 13.95, lon: 121.73 },
    { name: "Ikirin", lat: 13.98, lon: 121.72 }
  ],
  center: [
    { name: "Castillo (Poblacion)", lat: 13.963, lon: 121.699 },
    { name: "Daungan (Poblacion)", lat: 13.962, lon: 121.698 },
    { name: "Del Carmen (Poblacion)", lat: 13.961, lon: 121.699 },
    { name: "Parang (Poblacion)", lat: 13.964, lon: 121.700 },
    { name: "Sta. Catalina (Poblacion)", lat: 13.965, lon: 121.701 },
    { name: "Tambak (Poblacion)", lat: 13.962, lon: 121.702 },
    { name: "Mapagong", lat: 13.966, lon: 121.705 },
    { name: "Pinagbayanan", lat: 13.967, lon: 121.707 }
  ],
  east: [
    { name: "Malicboy Kan.", lat: 13.97, lon: 121.73 },
    { name: "Malicboy Sil.", lat: 13.97, lon: 121.74 },
    { name: "Mayhay", lat: 13.98, lon: 121.75 },
    { name: "Palsabangon Iba.", lat: 13.99, lon: 121.72 },
    { name: "Palsabangon Ila.", lat: 13.99, lon: 121.73 },
    { name: "Talipan", lat: 13.96, lon: 121.74 },
    { name: "Tukalan", lat: 13.95, lon: 121.76 },
    { name: "Polo Iba.", lat: 13.96, lon: 121.77 },
    { name: "Polo Ila.", lat: 13.96, lon: 121.78 }
  ]
};

// Fetch weather for a barangay
async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
  const res = await fetch(url);
  return res.json();
}

// Fetch traffic (TomTom flow segment near barangay)
async function getTraffic(lat, lon) {
  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&unit=KMPH&key=${TOMTOM_API_KEY}`;
  const res = await fetch(url);
  return res.json();
}

// Display barangay info
async function renderBarangay(group, elementId) {
  const container = document.getElementById(elementId);

  for (let b of group) {
    const [weather, traffic] = await Promise.all([
      getWeather(b.lat, b.lon),
      getTraffic(b.lat, b.lon)
    ]);

    const w = weather.main;
    const t = traffic.flowSegmentData || {};

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${b.name}</h3>
      <p><b>Weather:</b> ${weather.weather[0].description}</p>
      <p>🌡️ Temp: ${w.temp}°C (feels ${w.feels_like}°C)</p>
      <p>💧 Humidity: ${w.humidity}% | ☁️ Clouds: ${weather.clouds.all}%</p>
      <p>💨 Wind: ${weather.wind.speed} m/s</p>
      <hr>
      <p><b>Traffic:</b></p>
      <p>🚗 Speed: ${t.currentSpeed || "N/A"} km/h</p>
      <p>📊 Free-flow: ${t.freeFlowSpeed || "N/A"} km/h</p>
      <p>⚠️ Congestion: ${t.currentTravelTime ? ((t.currentTravelTime/t.freeFlowTravelTime*100).toFixed(0) + "%") : "N/A"}</p>
    `;

    container.appendChild(card);
  }
}

// PAGASA Advisories (scraping headlines)
async function loadPAGASA() {
  try {
    const res = await fetch("https://www.panahon.gov.ph/");
    const text = await res.text();
    // crude scrape: get first advisory headline
    const match = text.match(/<h2.*?>(.*?)<\/h2>/);
    document.getElementById("pagasa-alerts").innerText = match ? match[1] : "No advisory found.";
  } catch (e) {
    document.getElementById("pagasa-alerts").innerText = "Could not load PAGASA advisories.";
  }
}

// Render all groups
renderBarangay(barangays.west, "west");
renderBarangay(barangays.center, "center");
renderBarangay(barangays.east, "east");
loadPAGASA();
