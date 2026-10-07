import { pinoHttp } from "pino-http";
import logger from "../lib/pino.js";

export default pinoHttp({
    logger,
    level: "info",
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url?.split("?")[0],
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
    },
});
