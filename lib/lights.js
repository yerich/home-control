import { Control } from "magic-home";
import SunCalc from "suncalc";

const lights = [
    {
        name: "kitchen-1",
        ip: "192.168.2.138",
    },
    {
        name: "kitchen-2",
        ip: "192.168.2.139",
    },
    {
        name: "kitchen-3",
        ip: "192.168.2.140",
    },
    {
        name: "kitchen-4",
        ip: "192.168.2.141",
    },
];

const timeBasedLights = () => {
    const sunpos = SunCalc.getPosition(new Date(), 43.741667, -79.373333).altitude * 180 / Math.PI;
    lights.forEach((light) => {
        if (light.name.indexOf("kitchen") === 0) {
            
        }
    });
}

let initiated = false;
export const initiate = () => {
    if (initiated) return;
    initiated = true;

    lights.forEach((light) => {
        light.control = new Control(light.ip);
    });

    setInterval(timeBasedLights, 1000);
    console.log("Lights initiated");
}

export const turnOff = (prefix) => {
    lights.forEach((light) => {
        if (prefix && light.name.indexOf(prefix) !== 0) return;

        light.control.turnOff();
    })
}

export const turnOn = (prefix) => {
    lights.forEach((light) => {
        if (prefix && light.name.indexOf(prefix) !== 0) return;

        light.control.turnOn();
    })
}
