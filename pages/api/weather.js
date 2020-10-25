function parseWeatherEntry(data) {
    let icon = "";
    let hour = data.timestamp.getHours();
    let night = hour < 6 || hour > 20;
    let desc = data.weather.description;
    console.log(data);
    if (data.weather.description === "clear sky") {
        icon = night ? "wi-night-clear" : "wi-day-sunny";
    } else if (data.weather.description.match(/overcast clouds/)) {
        icon = "wi-cloud";
    } else if (data.weather.description.match(/clouds/)) {
        icon = night ? "wi-night-alt-cloudy" : 'wi-day-cloudy';
    } else if (data.weather.description.match(/thunderstorm/)) {
        icon = "wi-thunderstorm";
    } else if (data.weather.description.match(/rain and snow/)) {
        icon = 'wi-rain-mix'; 
        desc = "Rain/Snow"
    } else if (data.weather.description.match(/freezing rain/)) {
        icon = 'wi-rain-mix';
        desc = "Freez. Rain"
    } else if (data.weather.description.match(/rain/)) {
        icon = "wi-rain";
    } else if (data.weather.description.match(/shower snow/)) {
        icon = night ? "wi-night-alt-snow" : 'wi-day-snow';
    } else if (data.weather.description.match(/snow/)) {
        icon = "wi-snow";
    } else if (data.weather.description.match(/drizzle/)) {
        icon = night ? "wi-night-alt-showers" : 'wi-day-showers';
    } else {
        icon = "wi-fog"
        desc = data.weather.description;
    }

    let time = data.time;
    if (!data.time) {
        time = hour;
        if (time === 0) {
            time = "12AM"
        } else if (time >= 12) {
            time = (time - 12) + "PM";
        } else {
            time = time + "AM";
        }
    }

    return {
        icon,
        time,
        temp: Math.round(data.main.temp),
        description: desc
    };
}

export default async (req, res) => {
    const weatherApiKey = process.env["WEATHER_API_KEY"];

    const currentWeatherData = await fetch("http://api.openweathermap.org/data/2.5/weather?q=Toronto&units=metric&APPID=" + weatherApiKey)
        .then(response => response.json())

    const futureWeatherData = await fetch("http://api.openweathermap.org/data/2.5/forecast?q=Toronto&units=metric&APPID=" + weatherApiKey)
        .then(response => response.json())

    currentWeatherData.timestamp = new Date(currentWeatherData.dt * 1000);
    currentWeatherData.weather = currentWeatherData.weather[0];
    const currentWeather = parseWeatherEntry(currentWeatherData);
    const futureWeather = [];

    let i = 0, j = 1;
    while (i < 2) {
        let timestamp = new Date(futureWeatherData.list[j].dt * 1000);
        if (timestamp.getHours() < 7 || timestamp.getHours() > 20) {
            j += 1;
            continue;
        }
        futureWeather.push(parseWeatherEntry({
            timestamp: timestamp,
            weather: futureWeatherData.list[j].weather[0],
            main: futureWeatherData.list[j].main
        }));
        j += 2;
        i += 1;
    };

    res.json([currentWeather].concat(futureWeather));
    res.statusCode = 200;
}
