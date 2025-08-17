interface OptionConfig {
  type: "boolean" | "string" | "number";
  default?: any;
  demandOption?: boolean;
}

interface Options {
  [key: string]: OptionConfig;
}

class Margs {
  private optionConfigs: Options = {};

  options(configs: Options): this {
    this.optionConfigs = configs;
    return this;
  }

  parseSync(argvSrc?: string): Record<string, any> {
    const args = argvSrc ? argvSrc.split(" ") : process.argv.slice(2);

    if (args.includes("--help")) {
      this.showHelp();
      process.exit(0);
    }

    const result: Record<string, any> = {};

    for (const [key, config] of Object.entries(this.optionConfigs)) {
      if (config.default !== undefined) {
        result[key] = config.default;
      }
    }

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg.startsWith("--")) {
        const { optionName, inlineValue } = this.parseOptionToken(arg);

        if (optionName in this.optionConfigs) {
          const config = this.optionConfigs[optionName];

          if (config.type === "boolean") {
            if (inlineValue !== undefined) {
              const v = this.unquote(inlineValue);
              if (v === "true") {
                result[optionName] = true;
              } else if (v === "false") {
                result[optionName] = false;
              } else {
                console.error(
                  `Error: Option --${optionName} requires a boolean value (true|false) when using --${optionName}=...`
                );
                this.showHelp();
                process.exit(1);
              }
            } else {
              const nextRaw = args[i + 1];
              if (nextRaw && !nextRaw.startsWith("--")) {
                const nextArg = this.unquote(nextRaw);
                if (nextArg === "true") {
                  result[optionName] = true;
                  i++;
                } else if (nextArg === "false") {
                  result[optionName] = false;
                  i++;
                } else {
                  result[optionName] = true;
                }
              } else {
                result[optionName] = true;
              }
            }
          } else if (config.type === "string") {
            const nextRaw = this.getNextRawIfNotOption(args, i);
            if (inlineValue !== undefined) {
              result[optionName] = this.unquote(inlineValue);
            } else if (nextRaw !== undefined) {
              result[optionName] = this.unquote(nextRaw);
              i++;
            } else {
              console.error(
                `Error: Option --${optionName} requires a string value`
              );
              this.showHelp();
              process.exit(1);
            }
          } else if (config.type === "number") {
            const nextRaw = this.getNextRawIfNotOption(args, i);
            if (inlineValue !== undefined) {
              result[optionName] = this.parseNumberFromRaw(
                this.unquote(inlineValue),
                optionName
              );
            } else if (nextRaw !== undefined) {
              result[optionName] = this.parseNumberFromRaw(
                this.unquote(nextRaw),
                optionName
              );
              i++;
            } else {
              console.error(
                `Error: Option --${optionName} requires a number value`
              );
              this.showHelp();
              process.exit(1);
            }
          }
        }
      }
    }

    for (const [key, config] of Object.entries(this.optionConfigs)) {
      if (config.demandOption && !(key in result)) {
        console.error(`Error: Missing required argument: --${key}`);
        this.showHelp();
        process.exit(1);
      }
    }

    return result;
  }

  private showHelp(): void {
    console.log("\nOptions:");
    console.log("  --help     Show help");

    for (const [key, config] of Object.entries(this.optionConfigs)) {
      let line = `  --${key}`;

      line = line.padEnd(15);

      if (config.type !== "boolean") {
        line += `<${config.type}>  `;
      } else {
        line += "         ";
      }

      const attributes: string[] = [];
      if (config.demandOption) {
        attributes.push("[required]");
      }
      if (config.default !== undefined) {
        attributes.push(`(default: ${config.default})`);
      }

      line += attributes.join(" ");
      console.log(line);
    }
  }

  private unquote(value: string): string {
    if (!value || value.length < 2) return value;
    const first = value[0];
    const last = value[value.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return value.substring(1, value.length - 1);
    }
    return value;
  }

  private parseOptionToken(token: string): {
    optionName: string;
    inlineValue?: string;
  } {
    let optionPart = token.substring(2);
    let inlineValue: string | undefined;
    const eqIndex = optionPart.indexOf("=");
    if (eqIndex !== -1) {
      inlineValue = optionPart.substring(eqIndex + 1);
      optionPart = optionPart.substring(0, eqIndex);
    }
    return { optionName: optionPart, inlineValue };
  }

  private getNextRawIfNotOption(args: string[], i: number): string | undefined {
    const nextRaw = args[i + 1];
    if (nextRaw && !nextRaw.startsWith("--")) return nextRaw;
    return undefined;
  }

  private parseNumberFromRaw(raw: string, optionName: string): number {
    const numValue = Number(raw);
    if (Number.isNaN(numValue)) {
      console.error(`Error: Option --${optionName} requires a valid number`);
      this.showHelp();
      process.exit(1);
    }
    return numValue;
  }
}

const margs = new Margs();
export default margs;
