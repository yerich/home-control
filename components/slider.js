import React, {useState} from "react";

const getPercentage = (current, min, max) => (100 * (current - min)) / (max - min);
const getLeft = percentage => `calc(${percentage}% - 20px)`;

export default function Slider({value, min, max, onChange, onDone}) {
    const initialPercentage = getPercentage(value, min, max);
    const [active, setActive] = useState(false);

    const trackRef = React.useRef();
    const thumbRef = React.useRef();

    const diff = React.useRef();
    const oldValue = React.useRef();
    
    const handleMouseMove = (event) => {
        let newX = event.touches[0].clientX - diff.current - trackRef.current.getBoundingClientRect().left;
        const end = trackRef.current.offsetWidth - thumbRef.current.offsetWidth;

        if (newX < 0) newX = 0;
        if (newX > end) newX = end;

        const newValue = Math.round((newX / end) * (max - min) + min);
        const newPercentage = getPercentage(newValue, min, max);

        thumbRef.current.style.left = getLeft(newPercentage);
        
        if (newValue !== oldValue.current) {
            onChange(newValue);
        }

        oldValue.current = newValue;
    };

    const handleMouseUp = () => {
        setActive(false);
        onDone(oldValue.current === undefined ? value : oldValue.current);
        document.removeEventListener('touchend', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
    };

    const handleMouseDown = (event) => {
        setActive(true);
        console.log(event);
        diff.current = event.touches[0].clientX - thumbRef.current.getBoundingClientRect().left;

        document.addEventListener('touchmove', handleMouseMove);
        document.addEventListener('touchend', handleMouseUp);
    };

    return <div className="slider">
      <div className="slider-track" ref={trackRef}>
          <div className={"slider-thumb" + (active ? " active" : "")}
            ref={thumbRef}
            style={{ left: getLeft(initialPercentage) }}
            onTouchStart={handleMouseDown} />
      </div>
      
      <style jsx>{`
        .slider { position: relative; height: 40px; flex: 1;}
        .slider-track { width: calc(100% - 40px); height: 40px; position: absolute; top: 0; left: 20px;}
        .slider-track::before { content: " "; position: absolute; top: 19px; width: 100%; background: #212121; height: 2px;}
        .slider-thumb { width: 40px; height: 40px; position: absolute; top: 0; border-radius: 20px; background: #333; border: 2px solid #CCC;}
        .slider-thumb.active { background: #CCC;}
      `}</style>
    </div>;
  }
  