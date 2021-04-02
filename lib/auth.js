import url from "url";

export const checkAuth = (req, res) => {
    return new Promise((resolve, reject) => {
        var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
        console.log("IP address:", ip);

        if (!ip.startsWith("192.168")) {
            let auth = req.body.auth;
            if (!auth) {
                const query = url.parse(req.url,true).query;
                auth = query.auth;
            }

            console.log("External request", ip, auth);

            if (!auth || auth != process.env["API_AUTH_TOKEN"]) {
                if (res) {
                    res.statusCode = 400;
                }
                reject();
                return;
            }
        }
        resolve();
    })
}