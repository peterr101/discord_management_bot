import { unlink, appendFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
const ERROR_LOG_PATH =
  dirname(fileURLToPath(import.meta.url)) + "/../output/error-log.txt";

export class Logger {
  async initialize() {
    if (existsSync(ERROR_LOG_PATH)) {
      await unlink(ERROR_LOG_PATH);
    }
  }

  async logError(message) {
    try {
      await appendFile(
        ERROR_LOG_PATH,
        `[${new Date().toLocaleString()}] ${message} \n`
      );
    } catch (e) {
      console.log(e);
    }
  }
}
