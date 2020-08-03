import React from "react";

export default function Switch({on, onChange}) {
  return <div className="buttons" className={on ? "buttons on" : "buttons off"} onClick={() => onChange(!on)}>
    <button className="on-label">On</button>
    <button className="off-label">Off</button>
    <div className="switch"></div>
    
    <style jsx>{`
      .buttons { font-size: 35px; color: #000; position: relative; overflow: hidden; display: inline-block; transition: all 200ms; border-radius: 100px; width: 150px;}
      button { width: 50%; height: 60px; line-height: 30px; border: 0;}
      .switch { position: absolute; top: 2px; left: 2px; width: calc(50%); height: calc(100% - 4px); transform: translateX(0); z-index: 1; transition: transform 200ms; border-radius: 100px; z-index: 1;}
      .on .switch { transform: translateX(calc(100% - 4px)); background: #CCC; }
      .off .switch { background: #333; }
      
      .on { border: 1px solid #FFF; color: #FFF; background: #111; }
      .off { border: 1px solid #333; color: #666; }
      .on button { color: #CCC; }
      .off button { color: #666; }
    `}</style>
  </div>;
}
