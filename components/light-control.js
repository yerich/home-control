import React, {useState} from "react";
import Switch from "./switch";
import Slider from "./slider";

function CustomSliders({lights}) {
  let currRed = 255;
  let currGreen = 255;
  let currBlue = 255;
  if (lights[0].customColor) {
    [currRed, currGreen, currBlue] = [lights[0].customColor.red, lights[0].customColor.green, lights[0].customColor.blue];
  }
  const [red, setRed] = useState(currRed);
  const [green, setGreen] = useState(currGreen);
  const [blue, setBlue] = useState(currBlue);

  const update = (newRed, newGreen, newBlue) => {
    console.log(newRed, newGreen, newBlue);
    fetch(`/api/lights?action=setCustomColor&prefix=${lights[0].prefix}&red=${newRed}&green=${newGreen}&blue=${newBlue}`);
  }

  return <div className="custom-sliders">
    <div className="slider-row">
      <div className="slider-label">Red</div>
      <Slider value={red} min={0} max={255} onChange={setRed} onDone={(v) => update(v, green, blue)} />
      <div className="slider-value">{red}</div>
    </div>
    <div className="slider-row">
      <div className="slider-label">Green</div>
      <Slider value={green} min={0} max={255} onChange={setGreen} onDone={(v) => update(red, v, blue)} />
      <div className="slider-value">{green}</div>
    </div>
    <div className="slider-row">
      <div className="slider-label">Blue</div>
      <Slider value={blue} min={0} max={255} onChange={setBlue} onDone={(v) => update(red, green, v)} />
      <div className="slider-value">{blue}</div>
    </div>

    <style jsx>{`
      .slider-row { display: flex; flex-direction: row; padding: 10px 0 10px 80px;}
      .slider-label { width: 100px; font-size: 25px; color: #CCC;}
      .slider-value { width: 100px; font-size: 25px; padding-left: 20px; color: #666;}
      Slider { flex: 1;}
    `}</style>
  </div>
}

function LightOptions({lights, refresh, toggleOptions}) {
  const currentMode = lights[0].mode === "off" ? lights[0].lastMode : lights[0].mode;

  const selectMode = (mode) => {
    fetch("/api/lights?action=mode&prefix=" + lights[0].prefix + "&mode=" + mode).then(refresh);
  }

  return <div className="light-options">
    <div className={"close-light-options"} onClick={toggleOptions}><i className="fa fa-times"></i></div>
    <div className={"light-mode" + (currentMode === "auto" ? " selected" : "")} onClick={() => selectMode("auto")}>Automatic</div>
    <div className={"light-mode" + (currentMode === "auto-dim" ? " selected" : "")} onClick={() => selectMode("auto-dim")}>Dim</div>
    <div className={"light-mode" + (currentMode === "auto-full" ? " selected" : "")} onClick={() => selectMode("auto-full")}>Full</div>
    <div className={"light-mode" + (currentMode === "custom" ? " selected" : "")} onClick={() => selectMode("custom")}>Custom</div>

    {currentMode === "custom" && <CustomSliders lights={lights} />}

    <style jsx>{`
      .close-light-options { position: absolute; top: 10px; right: 20px; font-size: 40px; padding: 20px;}
      .light-options { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #000; z-index: 2; padding: 20px 0; }
      .light-mode { font-size: 30px; padding: 15px 40px; }
      .light-mode.selected { font-weight: bold; color: #FFF;}
    `}</style>
  </div>
}

export default function LightControl({lights, refresh}) {
  const [optionsVisible, setOptionsVisible] = useState(false);

  if (!lights || !lights.length) {
    return null;
  }

  const selectLight = (on) => {
    if (on) {
      fetch("/api/lights?action=on&prefix=" + lights[0].prefix).then(refresh)
    } else {
      fetch("/api/lights?action=off&prefix=" + lights[0].prefix).then(refresh)
    }
  }

  const toggleOptions = () => {
    setOptionsVisible(!optionsVisible);
  }

  const lightOn = lights[0].mode !== "off";

  return <div className={"light-control " + (lightOn ? "on" : "off")}>
    <button style={{border: 0}} onClick={toggleOptions}>
      <i className="fa fa-cog" style={{color: lightOn ? "#CCC" : "#666", transition: "all 200ms"}}></i>
    </button>
    <Switch on={lightOn} onChange={selectLight} />

    {optionsVisible && <LightOptions lights={lights} refresh={refresh} toggleOptions={toggleOptions} />}

    <style jsx>{`
      .light-control { display: flex; color: #999;}
    `}</style>
  </div>;
}
