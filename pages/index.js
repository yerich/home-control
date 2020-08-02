import Head from 'next/head'
import { useEffect, useState } from "react";
import moment from "moment";
import LightControl from "../components/light-control";

export default function Home() {
  const [time, setTime] = useState(Date.now());
  const [lights, setLights] = useState([]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setTime(Date.now());
    }, (1000 - time % 1000));

    return () => clearTimeout(timer);
  });

  const refreshLights = () => {
    fetch("/api/lights?action=status").then(res => res.json()).then(setLights);
  }

  useEffect(() => {
    fetch("/api/lights").then(res => res.json()).then(console.log);

    const interval = setInterval(() => {
      fetch("/api/lights?action=checkTime");
    }, 10000);

    refreshLights();

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <Head>
        <title>Home control 2</title>
        <link rel="stylesheet" href="/global.css" />
        <link rel="stylesheet" href="/font-awesome/css/font-awesome.min.css" />
      </Head>

      <main>
        <div className="header">
          <div className="date">
            {moment.unix(time / 1000).format('dddd, MMMM D, YYYY')}
          </div>
          <div className="time">
            {moment.unix(time / 1000).format('HH:mm:ss')}
          </div>
        </div>
        
        <div className="light-controls">
          <div className="control-row">
            <div className="control-label">Kitchen</div>
            <LightControl lights={lights.filter(l => l.name.startsWith("kitchen"))} refresh={refreshLights} />
          </div>
        </div>
      </main>

      <style jsx>{`
        .header { text-align: center;}
        .date { margin-top: 10px; font-size: 35px;}
        .time { margin-top: -25px; font-size: 125px;}
        .light-controls { margin: 10px 40px;}

        .control-row { display: flex; flex-direction: row; align-items: center;}
        .control-label { font-size: 25px; text-transform: uppercase; letter-spacing: 3px; flex: 1;}
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
