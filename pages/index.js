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
        .date { margin-top: 10px; font-size: 50px;}
        .time { margin-top: -25px; font-size: 150px;}
        .light-controls { padding: 20px 50px; position: relative;}

        .control-row { display: flex; flex-direction: row; align-items: center; margin-bottom: 20px;}
        .control-label { font-size: 25px; text-transform: uppercase; letter-spacing: 3px; flex: 1;}

        .container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden;}
        .wrapper { display: flex; flex-direction: row; height: 800px;}
        .left { width: 720px; height: 100%;}
        .right { flex: 1;}
        .border { width: 1px; height: 93%; align-self: center; background: #666;}
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
