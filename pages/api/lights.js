import url from "url";
import { Control } from "magic-home";
import SunCalc from "suncalc";
import * as storage from "node-persist";
import { checkAuth } from "../../lib/auth.js";

storage.init();

const lights = [
    {
        name: "kitchen-1",
        ip: "192.168.2.146",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "kitchen",
    },
    {
        name: "kitchen-2",
        ip: "192.168.2.160",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "kitchen",
    },
    {
        name: "kitchen-3",
        ip: "192.168.2.161",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "kitchen",
    },
    {
        name: "kitchen-4",
        ip: "192.168.2.174",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "kitchen",
    },
    {
        name: "desk-1",
        ip: "192.168.2.143",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "desk",
    },
    {
        name: "monitor-1",
        ip: "192.168.2.150",
        apply_masks: false,
        cold_white_support: false,
        colorOnly: true,
        colorOnlyType: 2,
        requireOnCommand: true,
        log_all_received: true,
        prefix: "monitor",
    },
    {
        name: "standing-1",
        ip: "192.168.2.175",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "standing-1",
    },
    {
        name: "standing-2a",
        ip: "192.168.2.158",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "standing-2",
    },
    {
        name: "standing-2b",
        ip: "192.168.2.159",
        apply_masks: true,
        cold_white_support: true,
        log_all_received: true,
        prefix: "standing-2",
    },
    {
        name: "display-case-1",
        ip: "192.168.2.147",
        apply_masks: true,
        cold_white_support: false,
        colorOnly: true,
        log_all_received: true,
        prefix: "display-case",
    },
    {
        name: "ceiling-a-1",
        ip: "192.168.2.165",
        apply_masks: true,
        cold_white_support: false,
        colorOnly: true,
        log_all_received: true,
        prefix: "ceiling-a",
    },
    {
        name: "ceiling-b-2",
        ip: "192.168.2.166",
        apply_masks: true,
        cold_white_support: false,
        colorOnly: true,
        log_all_received: true,
        prefix: "ceiling-b",
    },
    {
        name: "ceiling-a-3",
        ip: "192.168.2.167",
        apply_masks: true,
        cold_white_support: false,
        colorOnly: true,
        log_all_received: true,
        prefix: "ceiling-a",
    },
    {
        name: "ceiling-b-4",
        ip: "192.168.2.168",
        apply_masks: true,
        cold_white_support: false,
        colorOnly: true,
        log_all_received: true,
        prefix: "ceiling-b",
    },
    {
        name: "ceiling-a-5",
        ip: "192.168.2.169",
        apply_masks: true,
        cold_white_support: false,
        colorOnly: true,
        log_all_received: true,
        prefix: "ceiling-a",
    },
    {
        name: "ceiling-b-6",
        ip: "192.168.2.170",
        apply_masks: true,
        cold_white_support: false,
        colorOnly: true,
        log_all_received: true,
        prefix: "ceiling-b",
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

    const now = new Date();
    const timeSeconds = now.getSeconds() + now.getMinutes() * 60 + now.getHours() * 60 * 60;

    let position = 0;
    let factor = 1;
    if (sunpos > 5) {
        position = 255;
    } else if (sunpos < -2) {
        position = 0;

        if (timeSeconds > 22 * 60 * 60 || timeSeconds < 5 * 60 * 60) {
            factor = 0.1;
        } else if (timeSeconds > 21.5 * 60 * 60) {
            factor = 1.0 - ((timeSeconds - 21.5 * 60 * 60) / (0.5 * 60 * 60)) * 0.9;
        } else if (timeSeconds < 5.5 * 60 * 60) {
            factor = ((timeSeconds - 5 * 60 * 60) / (0.5 * 60 * 60)) * 0.9 + 0.1;
        }
    } else {
        position = Math.round(((sunpos + 2) / 7) * 255);
    }

    if (light.mode === "auto-dim") {
        factor = 0.1;
    } else if (light.mode === "auto-full") {
        factor = 1.0;
    }

    if (light.colorOnly) {
        let day, night;
        if (light.colorOnlyType === 2) {
            day = [255, 222, 78];
            night = [255, 112, 11];
        } else {
            day = [255, 136, 115];
            night = [255, 82, 37];
        }
        light.control.setColorWithBrightness(
            day[0] * (position / 255) + night[0] * (1 - position / 255),
            day[1] * (position / 255) + night[1] * (1 - position / 255),
            day[2] * (position / 255) + night[2] * (1 - position / 255),
            factor * 100
        );
    } else {
        if (light.lastSetTimeWhites && light.lastSetTimeWhites[0] === Math.round((255 - position) * factor) && light.lastSetTimeWhites[1] === Math.round(position * factor)) return;
        light.lastSetTimeWhites = [Math.round((255 - position) * factor), Math.round(position * factor)];
        light.control.setWhites(Math.round((255 - position) * factor), Math.round(position * factor));
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
                if (state?.on) {
                    if (cachedLights[light.name]) {
                        if (cachedLights[light.name].mode !== "off") {
                            light.mode = cachedLights[light.name].mode;
                        } else if (cachedLights[light.name].lastMode !== "off") {
                            light.mode = cachedLights[light.name].lastMode;
                        } else {
                            light.mode = "auto";
                        }
                    }
                    if (state.mode === "color") {
                        light.customColor = state.color;
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

const doSetMode = (light, mode) => {
    console.log("Setting light " + light.name + " to " + mode);
    light.mode = mode;
    light.lastSetTimeWhites = null;
    if (mode !== "off") {
        light.lastMode = mode;
        if (light.requireOnCommand) {
            light.control.turnOn();
        }
    }
    if (mode === "off") {
        light.control.turnOff();
    } else if (mode && mode.startsWith("auto")) {
        timeBasedLight(light, mode);
    } else if (mode === "on") {
        light.control.setWhites(255, 0);
    } else if (mode === "custom") {
        if (light.customColor) {
            light.control.setColor(light.customColor.red, light.customColor.green, light.customColor.blue);
        } else {
            light.control.setColor(255, 255, 255);
        }
    }
}

export const setMode = (prefix, mode) => {
    forEachLight(prefix, (light) => {
        doSetMode(light, mode);
    });
    saveCache();
}

export const turnOff = (prefix) => {
    forEachLight(prefix, (light) => {
        if (light.mode != "off") {
            light.lastMode = light.mode;
        }
        doSetMode(light, "off");
    });
    saveCache();
}

export const turnOn = (prefix, mode) => {
    forEachLight(prefix, (light) => {
        let newMode = mode || light.lastMode || "auto";
        if (newMode === "off" || newMode === "on") newMode = "auto";
        doSetMode(light, newMode);
    });
    saveCache();
}

export const setCustomColor = (prefix, red, green, blue) => {
    forEachLight(prefix, (light) => {
        light.customColor = {red, green, blue};
        doSetMode(light, "custom");
    });
    saveCache();
}

initiate();
export default async (req, res) => {
    try {
        await checkAuth(req);
    } catch (e) {
        res.status(401).send("Unauthorized");
        return;
    }

    const query = url.parse(req.url,true).query;
    res.statusCode = 200;

    if (query.action === "off") {
        turnOff(query.prefix);
    } else if (query.action === "on") {
        turnOn(query.prefix, query.mode);
    } else if (query.action === "mode") {
        setMode(query.prefix, query.mode);
    } else if (query.action === "checkTime") {
        lights.forEach(light => {
            if (light.mode && light.mode.startsWith("auto")) timeBasedLight(light);
        });
    } else if (query.action === "status") {
        res.json(lights.map(light => {
            return {
                ...light,
                control: null
            }
        }));
        return;
    } else if (query.action === "setCustomColor") {
        setCustomColor(query.prefix, parseInt(query.red, 10), parseInt(query.green, 10), parseInt(query.blue, 10));
    }
    res.json({ data: "OK" });
    res.statusCode = 200;
}
