import Head from 'next/head'
import { useEffect, useState } from "react";
import moment from "moment";
import LightControl from "../components/light-control";

const WeatherEntry = ({data, index}) => {
  return <div className="weather-entry">
    <div className="weather-entry-header">{index === 0 ? "Now" : data.time}</div>
    <div className="weather-entry-icon"><i className={"wi " + data.icon}></i></div>
    <div className="weather-entry-temperature">{data.temp}&deg;</div><br />
    <div className="weather-entry-description">{data.description}</div>

    <style jsx>{`
      .weather-entry { text-align: left; white-space: nowrap; display: inline-block; position: relative; height: 140px; margin-right: 60px; margin-bottom: 10px;}
      .weather-entry:last-child { margin-right: 0;}
      .weather-entry-header { font-size: 25px; text-transform: uppercase; letter-spacing: 10px; color: #CCC; text-align: left; margin-bottom: 5px;}
      .weather-entry-icon { font-size: 60px; opacity: 0.7; text-align: center; float: left; margin-right: 20px;}
      .weather-entry-temperature { font-size: 60px; display: inline-block;}
      .weather-entry-description { font-size: 25px; display: inline-block; clear: both; letter-spacing: -1px; width: 170px;}
  
      .weather-detailed-wrapper { display: none; text-align: center; position: absolute; top: 585px; width: 100%; height: 600px; background: #000;}
      .weather-detailed-wrapper iframe { text-align: center; margin-top:200px; transform: scale(1.5);}
      .weather-detailed-wrapper a { display: none;}
    `}</style>
  </div>
}

export default function Home() {
  const [time, setTime] = useState(Date.now());
  const [lights, setLights] = useState([]);
  const [weather, setWeather] = useState([]);
  const [showDetailedWeather, setShowDetailedWeather] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(Date.now());
    }, (1000 - time % 1000));

    return () => clearInterval(timer);
  }, []);

    
  useEffect(() => {
    fetch("/api/weather").then(res => res.json()).then(setWeather);

    const timer = setInterval(() => {
      fetch("/api/weather").then(res => res.json()).then(setWeather);
    }, (120000 - time % 120000));

    return () => clearInterval(timer);
  }, []);
  

  const refreshLights = () => {
    fetch("/api/lights?action=status").then(res => res.json()).then(setLights);
  }

  useEffect(() => {
    fetch("/api/lights").then(res => res.json()).then(console.log);

    const interval = setInterval(() => {
      fetch("/api/lights?action=checkTime");
      refreshLights();
    }, 10000);

    refreshLights();

    return () => clearInterval(interval);
  }, []);

  if (!weather.map) {
    debugger;
  }
  const weatherEntries = (weather || []).map((w, i) => <WeatherEntry data={w} index={i} key={i} />)

  return (
    <div className="container">
      <Head>
        <title>Home control 2</title>
        <link rel="stylesheet" href="/global.css" />
        <link rel="stylesheet" href="/weather-icons.css" />
        <link rel="stylesheet" href="/font-awesome/css/font-awesome.min.css" />
        <meta name="viewport" content="width=1280, user-scalable=no" />
      </Head>

      <main>
        <div className="wrapper">
          <div className="left">
            <div className="header">
              <div className="date">
                {moment.unix(time / 1000).format('dddd, MMMM D, YYYY')}
              </div>
              <div className="time">
                {moment.unix(time / 1000).format('HH:mm:ss')}
              </div>
            </div>

            <div className="weather-wrapper">
              {weatherEntries}
            </div>

            {showDetailedWeather  &&<div className="detailed-weather">
              <iframe src={"https://www.meteoblue.com/en/weather/widget/three/toronto_canada_6167865?geoloc=fixed&amp;nocurrent=0&amp;noforecast=0&amp;" +
                "days=5&amp;tempunit=CELSIUS&amp;windunit=KILOMETER_PER_HOUR&amp;layout=dark&amp;location_url=https%3A%2F%2Fwww.meteoblue.com%2Fen%2Fweather" +
                "%2Fwidget%2Fthree%2Ftoronto_canada_6167865&amp;location_mainUrl=https%3A%2F%2Fwww.meteoblue.com%2Fen%2Fweather%2Fweek%2Ftoronto_canada_6167865" +
                "&amp;nolocation_url=https%3A%2F%2Fwww.meteoblue.com%2Fen%2Fweather%2Fwidget%2Fthree&amp;nolocation_mainUrl=https%3A%2F%2Fwww.meteoblue.com%2Fen" +
                "%2Fweather%2Fweek%2Findex&amp;dailywidth=115&amp;tracking=%3Futm_source%3Dweather_widget%26utm_medium%3Dlinkus%26utm_content%3Dthree%26" +
                "utm_campaign%3DWeather%252BWidget"} frameborder="0" scrolling="NO" allowtransparency="true" 
                sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox" style={{width: 720, height: 600}}></iframe>
              <div>
                <a href="https://www.meteoblue.com/en/weather/week/toronto_canada_6167865?utm_source=weather_widget&amp;utm_medium=linkus&amp;utm_content=three&amp;utm_campaign=Weather%2BWidget" target="_blank">meteoblue</a>
              </div>
            </div>}
          </div>
          
          <div className="border"></div>
          <div className="right">
            <div className="light-controls">
              <div className="control-row">
                <div className="control-label">Kitchen</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("kitchen"))} refresh={refreshLights} />
              </div>
              <div className="control-row">
                <div className="control-label">Desk</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("desk"))} refresh={refreshLights} />
              </div>
              <div className="control-row">
                <div className="control-label">Standing Light</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("standing"))} refresh={refreshLights} />
              </div>
              <div className="control-row">
                <div className="control-label">Display Case</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("display-case"))} refresh={refreshLights} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .header { text-align: center;}
        .date { margin-top: 10px; font-size: 40px;}
        .time { margin-top: -25px; font-size: 150px; margin-bottom: 30px;}
        .light-controls { padding: 20px 50px; position: relative;}

        .control-row { display: flex; flex-direction: row; align-items: center; margin-bottom: 20px;}
        .control-label { font-size: 25px; text-transform: uppercase; letter-spacing: 3px; flex: 1;}

        .container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;}
        .wrapper { display: flex; flex-direction: row; height: 800px;}
        .left { width: 720px; height: 100%;}
        .right { flex: 1;}
        .border { width: 1px; height: 93%; align-self: center; background: #666;}

        .weather-wrapper { text-align: center; margin-bottom: 20px;}
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: 'open sans', sans-serif;
          background: #000;
          color: #FFF;
        }

        * { box-sizing: border-box; }
        
        button { display: inline-block; background: transparent; color: #FFF; font-size: 30px; border: 1px solid #CCC; padding: 10px 20px; width: 3em;}
        button:active, button:focus { outline: 0 !important; }
      `}</style>
    </div>
  )
}
