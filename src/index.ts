import { createInterface } from "readline";
import chalk from "chalk";

export class Command {
  constructor(
    public name: string,
    public description: string,
    public callback: (args: string[], cli: CLI) => Promise<void> | void
  ) {}

  async execute(args: string[], cli: CLI): Promise<void> {
    await this.callback(args, cli);
  }
}

export class CLI {
  private commands: Map<string, Command>;

  constructor() {
    this.commands = new Map();
  }

  addCommand(
    name: string,
    description: string,
    callback: (args: string[], cli: CLI) => Promise<void> | void
  ): void {
    const lowerCaseName = name.toLowerCase();

    if (this.commands.has(lowerCaseName)) {
      console.error(
        chalk.red(
          `Command with name '${name}' already exists. Ignoring duplicate.`
        )
      );
      return;
    }

    const command = new Command(name, description, callback);
    this.commands.set(lowerCaseName, command);
  }

  showHelp(): void {
    console.log(chalk.bold("Available Commands:"));
    for (const [name, command] of this.commands) {
      console.log(`${chalk.green(name)}: ${command.description}`);
    }
  }

  async handleInput(input: string): Promise<void> {
    const trimmedInput = input.trim();

    if (trimmedInput === "") {
      console.log(
        chalk.yellow(
          'Please enter a valid command. Type "--help" for a list of available commands.'
        )
      );
      return;
    }

    const [commandName, ...args] = trimmedInput.split(" ");
    const lowerCaseCommandName = commandName.toLowerCase();
    const command = this.commands.get(lowerCaseCommandName);

    if (command) {
      try {
        await command.execute(args, this);
      } catch (error: any) {
        console.error(
          chalk.red(
            `Error executing command '${commandName}': ${
              error.message || error
            }`
          )
        );
      }
    } else if (lowerCaseCommandName === "--help") {
      this.showHelp();
    } else {
      console.log(
        chalk.red(
          `Unrecognized command '${commandName}'. Type "--help" for a list of available commands.`
        )
      );
    }
  }

  start(): void {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "> ",
    });

    rl.prompt();

    rl.on("line", async (line) => {
      const input = line.trim();

      try {
        await this.handleInput(input);
      } catch (error: any) {
        console.error(
          chalk.red(`Error processing input: ${error.message || error}`)
        );
      }

      rl.prompt();
    }).on("close", () => {
      console.log(chalk.yellow("Exiting CLI."));
      process.exit(0);
    });
  }
}
