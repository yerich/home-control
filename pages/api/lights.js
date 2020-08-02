import url from "url";
import { Control } from "magic-home";
import SunCalc from "suncalc";
import * as storage from "node-persist";

storage.init();

const lights = [
    {
        name: "kitchen-1",
        ip: "192.168.2.138",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "kitchen",
    },
    {
        name: "kitchen-2",
        ip: "192.168.2.139",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "kitchen",
    },
    {
        name: "kitchen-3",
        ip: "192.168.2.140",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "kitchen",
    },
    {
        name: "kitchen-4",
        ip: "192.168.2.141",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "kitchen",
    },
];

const lightsByName = {};
lights.forEach((light) => lightsByName[light.name] = light);

const forEachLight = function(prefix, fn) {
    lights.forEach((light) => {
        if (prefix && light.name.indexOf(prefix) !== 0) return;
        fn(light);
    })
}

const timeBasedLight = (light) => {
    let sunpos = SunCalc.getPosition(new Date(), 43.741667, -79.373333).altitude * 180 / Math.PI;
    console.log(sunpos);
    if (light.prefix === "kitchen") {
        if (sunpos > 5) {
            light.control.setColorAndWhites(0, 0, 0, 0, 255);
        } else if (sunpos < -2) {
            light.control.setColorAndWhites(0, 0, 0, 255, 0);
        } else {
            const factor = Math.round(((sunpos + 2) / 7) * 255);
            console.log(factor, 255 - factor);
            light.control.setColorAndWhites(0, 0, 0, 255 - factor, factor)
        }
    }
}

let initiated = false;
let timeBasedLightsInterval;
export const initiate = () => {
    if (initiated) return;
    initiated = true;

    storage.getItem("lights").then(cachedLights => {
        console.log("cached lights", cachedLights);
    
        lights.forEach((light) => {
            light.control = new Control(light.ip, {
                cold_white_support: light.cold_white_support,
                apply_masks: light.apply_masks,
                ack: { power: false, color: false, pattern: false, custom_pattern: false}
            });
            light.control.queryState((err, state) => {
                light.status = state;
                if (state.on) {
                    if (cachedLights[light.name]) {
                        if (cachedLights[light.name].mode !== "off") {
                            light.mode = cachedLights[light.name].mode;
                        } else if (cachedLights[light.name].lastMode !== "off") {
                            light.mode = cachedLights[light.name].lastMode;
                        } else {
                            light.mode = "auto";
                        }
                    }
                } else {
                    light.mode = "off";
                }

                if (cachedLights[light.name]) {
                    light.lastMode = cachedLights[light.name].lastMode || "auto";
                }
            });
        });
    
        clearInterval(timeBasedLightsInterval);
        console.log("Lights initiated 2");
    });
}

const saveCache = () => {
    const saveObj = {};
    lights.forEach((light) => saveObj[light.name] = {
        ...light,
        control: null
    });
    storage.setItem("lights", saveObj);
}

const setMode = (light, mode) => {
    console.log("Setting light " + light.name + " to " + mode);
    light.mode = mode;
    light.lastMode = mode;
    if (mode === "off") {
        light.control.setColorAndWhites(0, 0, 0, 0, 0);
    } else if (mode === "auto") {
        timeBasedLight(light);
    } else if (mode === "on") {
        light.control.setColorAndWhites(0, 0, 0, 255, 0);
    }
}

export const turnOff = (prefix) => {
    forEachLight(prefix, (light) => {
        if (light.mode != "off") {
            light.lastMode = light.mode;
        }
        setMode(light, "off");
    });
    saveCache();
}

export const turnOn = (prefix, mode) => {
    forEachLight(prefix, (light) => {
        let newMode = mode || light.lastMode || "auto";
        if (newMode === "off" || newMode === "on") newMode = "auto";
        setMode(light, newMode);
    });
    saveCache();
}

initiate();
export default (req, res) => {
    const query = url.parse(req.url,true).query;
    res.statusCode = 200;

    if (query.action === "off") {
        turnOff(query.prefix);
    } else if (query.action === "on") {
        turnOn(query.prefix, query.mode);
    } else if (query.action === "checkTime") {
        lights.forEach(light => {
            if (light.mode === "auto") timeBasedLight(light);
        });
    } else if (query.action === "status") {
        res.json(lights.map(light => {
            return {
                ...light,
                control: null
            }
        }));
        return;
    }
    res.json({ data: "OK" });
    res.statusCode = 200;
}
