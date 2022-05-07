import url from "url";

export const checkAuth = (req, res) => {
    return new Promise((resolve, reject) => {
        var ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
        console.log("IP address:", ip);
        console.log("test1", ip.startsWith("192.168"), "test");

        if (!ip.startsWith("192.168") && !ip.startsWith("127.0.0")) {
            console.log("test2");
            let auth = req.body?.auth;
            if (!auth) {
                const query = url.parse(req.url,true).query;
                auth = query.auth;
            }
            console.log("test3");

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