const OPENWEATHER_KEY = "d77dbc9c66952dae67f86c58ab653dec";
const TOMTOM_KEY = "AnWOBls5vLcwsWYRDnxX8Qf2UKPKHkHb";

// Barangay coordinates (approx — you can refine lat/lon)
const barangays = {
  west: [
    { name: "Añato", lat: 13.94, lon: 121.72 },
    { name: "Alupaye", lat: 13.95, lon: 121.73 },
    { name: "Antipolo", lat: 13.96, lon: 121.71 },
    { name: "Bagumbungan Iba.", lat: 13.95, lon: 121.74 },
    { name: "Bagumbungan Ila.", lat: 13.94, lon: 121.75 },
    { name: "Bantigue", lat: 13.93, lon: 121.72 },
    { name: "Bigo", lat: 13.94, lon: 121.73 },
    { name: "Binahaan", lat: 13.96, lon: 121.72 },
    { name: "Bukal", lat: 13.95, lon: 121.76 },
    { name: "Ikirin", lat: 13.93, lon: 121.74 },
  ],
  center: [
    { name: "Castillo (Poblacion)", lat: 13.964, lon: 121.69 },
    { name: "Daungan (Poblacion)", lat: 13.963, lon: 121.689 },
    { name: "Del Carmen (Poblacion)", lat: 13.962, lon: 121.688 },
    { name: "Parang (Poblacion)", lat: 13.961, lon: 121.687 },
    { name: "Sta. Catalina (Poblacion)", lat: 13.960, lon: 121.690 },
    { name: "Tambak (Poblacion)", lat: 13.965, lon: 121.691 },
    { name: "Mapagong", lat: 13.966, lon: 121.692 },
    { name: "Pinagbayanan", lat: 13.967, lon: 121.693 },
  ],
  east: [
    { name: "Malicboy Kan.", lat: 13.970, lon: 121.70 },
    { name: "Malicboy Sil.", lat: 13.971, lon: 121.71 },
    { name: "Mayhay", lat: 13.972, lon: 121.72 },
    { name: "Palsabangon Iba.", lat: 13.973, lon: 121.73 },
    { name: "Palsabangon Ila.", lat: 13.974, lon: 121.74 },
    { name: "Talipan", lat: 13.975, lon: 121.75 },
    { name: "Tukalan", lat: 13.976, lon: 121.76 },
    { name: "Polo Iba.", lat: 13.977, lon: 121.77 },
    { name: "Polo Ila.", lat: 13.978, lon: 121.78 },
  ]
};

// Fetch weather
async function getWeather(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;
  const res = await fetch(url);
  return res.json();
}

// Fetch traffic (TomTom Flow Segment)
async function getTraffic(lat, lon) {
  const url = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?point=${lat},${lon}&unit=KMPH&key=${TOMTOM_KEY}`;
  const res = await fetch(url);
  return res.json();
}

// Render barangay cards
async function renderBarangays(group, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  for (let b of group) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<h3>${b.name}</h3><p class="loading">Loading data...</p>`;
    container.appendChild(card);

    try {
      const [weather, traffic] = await Promise.all([
        getWeather(b.lat, b.lon),
        getTraffic(b.lat, b.lon)
      ]);

      const desc = weather.weather[0].description;
      const temp = weather.main.temp;
      const humidity = weather.main.humidity;
      const wind = weather.wind.speed;
      const clouds = weather.clouds.all;

      let trafficText = "No traffic data";
      if (traffic.flowSegmentData) {
        const spd = traffic.flowSegmentData.currentSpeed;
        const free = traffic.flowSegmentData.freeFlowSpeed;
        const jamFactor = traffic.flowSegmentData.confidence;
        trafficText = `Speed: ${spd} km/h (Normal: ${free} km/h)`;
      }

      card.innerHTML = `
        <h3>${b.name}</h3>
        <p>🌡 Temp: ${temp}°C</p>
        <p>💧 Humidity: ${humidity}%</p>
        <p>🌬 Wind: ${wind} m/s</p>
        <p>☁ Clouds: ${clouds}%</p>
        <p>🌍 Weather: ${desc}</p>
        <p>🚗 Traffic: ${trafficText}</p>
      `;
    } catch (e) {
      card.innerHTML += `<p>Error loading data</p>`;
    }
  }
}

// PAGASA Alerts (RSS feed fallback)
async function loadPAGASAAlerts() {
  const container = document.getElementById("pagasa-alerts");
  try {
    const res = await fetch("https://www.panahon.gov.ph/rss_feed.xml");
    const text = await res.text();
    container.innerHTML = text.includes("<item>") 
      ? "⚡ PAGASA Alerts available (RSS feed parsed)" 
      : "✅ No current PAGASA alerts.";
  } catch (err) {
    container.innerHTML = "Could not fetch PAGASA alerts.";
  }
}

// Run
renderBarangays(barangays.west, "west-barangays");
renderBarangays(barangays.center, "center-barangays");
renderBarangays(barangays.east, "east-barangays");
loadPAGASAAlerts();
