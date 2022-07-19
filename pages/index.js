import Head from 'next/head'
import { useEffect, useState } from "react";
import moment from "moment";
import LightControl from "../components/light-control";
import { checkAuth } from "../lib/auth";

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

export const getServerSideProps = async ({req, res}) => {
  try {
    await checkAuth(req, res);
  } catch {
    return {notFound: true};
  }

  return {props: {}}
};

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
    }, (600000 - time % 600000));

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

            <div className="weather-wrapper" onClick={() => setShowDetailedWeather(true)}>
              {weatherEntries}
            </div>

            {showDetailedWeather && <div className="detailed-weather">
              <div className="detailed-weather-close" onClick={() => setShowDetailedWeather(false)}><i className="fa fa-times"></i></div>
              <div className="detailed-weather-inner">
                <iframe src={"https://www.meteoblue.com/en/weather/widget/three/toronto_canada_6167865?geoloc=fixed&nocurrent=0&noforecast=0&" +
                  "days=7&tempunit=CELSIUS&windunit=KILOMETER_PER_HOUR&layout=image&location_url=https%3A%2F%2Fwww.meteoblue.com%2Fen%2Fweather" +
                  "%2Fwidget%2Fthree%2Ftoronto_canada_6167865&location_mainUrl=https%3A%2F%2Fwww.meteoblue.com%2Fen%2Fweather%2Fweek%2Ftoronto_canada_6167865" +
                  "&nolocation_url=https%3A%2F%2Fwww.meteoblue.com%2Fen%2Fweather%2Fwidget%2Fthree&nolocation_mainUrl=https%3A%2F%2Fwww.meteoblue.com%2Fen" +
                  "%2Fweather%2Fweek%2Findex&dailywidth=115&tracking=%3Futm_source%3Dweather_widget%26utm_medium%3Dlinkus%26utm_content%3Dthree%26" +
                  "utm_campaign%3DWeather%252BWidget"} frameborder="0" scrolling="NO" allowtransparency="true"
                  sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox" style={{width: 840, height: 600}}></iframe>
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
                <div className="control-label">Monitor</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("monitor"))} refresh={refreshLights} />
              </div>
              <div className="control-row">
                <div className="control-label">Standing 1</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("standing-1"))} refresh={refreshLights} />
              </div>
              <div className="control-row">
                <div className="control-label">Standing 2</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("standing-2"))} refresh={refreshLights} />
              </div>
              <div className="control-row">
                <div className="control-label">Ceiling 1</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("ceiling-a"))} refresh={refreshLights} />
              </div>
              <div className="control-row">
                <div className="control-label">Ceiling 2</div>
                <LightControl lights={lights.filter(l => l.name.startsWith("ceiling-b"))} refresh={refreshLights} />
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
        .detailed-weather { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; background: rgba(0, 0, 0, 0.6);}
        .detailed-weather-inner { position: absolute; top: 50px; left: 230px;}
        .detailed-weather-close { position: absolute; top: 20px; right: 180px; font-size: 40px; width: 60px; height: 60px; text-align: center; border: 2px solid #444; line-height: 51px; z-index: 3; background: #000; border-radius: 30px;}
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
