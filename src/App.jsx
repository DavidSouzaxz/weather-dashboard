import { useState } from "react";
import axios from "axios";
import "./App.css";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getWeather = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setWeather(null);

    try {
      // 1️⃣ Buscar coordenadas
      const geoRes = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          city
        )}`
      );
      const place = geoRes.data.results?.[0];
      if (!place) throw new Error("Cidade não encontrada");

      // 2️⃣ Buscar clima atual
      const weatherRes = await axios.get(
        "https://api.open-meteo.com/v1/forecast",
        {
          params: {
            latitude: place.latitude,
            longitude: place.longitude,
            current_weather: true,
            timezone: "America/Sao_Paulo",
          },
        }
      );

      const weatherData = weatherRes.data.current_weather;

      // 3️⃣ Determinar ícone/emoticon
      const emoji =
        weatherData.weathercode === 0
          ? "☀️"
          : [1, 2].includes(weatherData.weathercode)
          ? "🌤️"
          : [3, 45, 48].includes(weatherData.weathercode)
          ? "☁️"
          : [51, 61, 63, 65].includes(weatherData.weathercode)
          ? "🌧️"
          : [71, 73, 75].includes(weatherData.weathercode)
          ? "❄️"
          : "🌫️";

      // 4️⃣ Montar resultado
      setWeather({
        city: `${place.name}, ${place.country}`,
        temperature: `${weatherData.temperature}°C`,
        windspeed: `${weatherData.windspeed} km/h`,
        time: weatherData.time,
        emoji,
      });
    } catch (err) {
      setError("Erro ao buscar clima. Verifique o nome da cidade.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") getWeather();
  };

  return (
    <div className="app">
      <h1>🌦️ WeatherNow</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Digite o nome da cidade..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={getWeather}>Buscar</button>
      </div>

      {loading && <p>⏳ Carregando...</p>}
      {error && <p className="error">{error}</p>}

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}</h2>
          <h1>{weather.emoji}</h1>
          <p>🌡️ {weather.temperature}</p>
          <p>💨 {weather.windspeed}</p>
          <p>🕒 {new Date(weather.time).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}
