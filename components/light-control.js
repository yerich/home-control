import React from "react";
import Switch from "./switch";

export default function LightControl({lights, refresh}) {
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

  const lightOn = lights[0].mode !== "off";

  return <div className={"light-control " + (lightOn ? "on" : "off")}>
    <button style={{border: 0}}><i className="fa fa-cog" style={{color: lightOn ? "#CCC" : "#666", transition: "all 200ms"}}></i></button>
    <Switch on={lightOn} onChange={selectLight} />

    <style jsx global>{`
      .light-control { display: flex; color: #999;}
    `}</style>
  </div>;
}
