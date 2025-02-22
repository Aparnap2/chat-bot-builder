// app/utils/logger.server.ts
import { join } from "path";

type LogLevel = "info" | "error" | "warn";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
}

export class Logger {
  private static logFile = join(process.cwd(), "logs", "app.log");

  static log(level: LogLevel, message: string, data?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
    const logString = JSON.stringify(entry) + "\n";

    // Output log to the terminal
    console.log(logString);

    // Optionally, you can still write to the log file if needed
    /*
    try {
      writeFileSync(this.logFile, logString, { flag: "a" });
    } catch (err) {
      console.error("Failed to write log:", err);
    }
    */
  }

  static info(message: string, data?: Record<string, any>) {
    this.log("info", message, data);
  }

  static error(message: string, data?: Record<string, any>) {
    this.log("error", message, data);
  }

  static warn(message: string, data?: Record<string, any>) {
    this.log("warn", message, data);
  }
}
