import { pinoHttp } from "pino-http";
import logger from "../lib/pino.js";

export default pinoHttp({ logger });
