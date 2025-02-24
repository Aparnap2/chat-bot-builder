type LogLevel = "info" | "error" | "warn";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: Record<string, any>;
}

export class Logger {
  static log(level: LogLevel, message: string, data?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };
    console.log(JSON.stringify(entry));
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