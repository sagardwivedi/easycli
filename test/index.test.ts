import { expect, jest, test, spyOn } from "bun:test";
import { CLI } from "../src";

// Test command registration
test("addCommand prevents duplicate commands", async () => {
  const cli = new CLI();
  cli.addCommand("test", "Test command", async () => {});
  expect(() => cli.addCommand("test", "Another test", async () => {}))
    .toMatchSnapshot(`
      Error: Command with name 'test' already exists. Ignoring duplicate.
    `);
});

test("commands are case-insensitive", async () => {
  const cli = new CLI();
  cli.addCommand("test", "Test command", async () => {});
  expect(() => cli.addCommand("TEST", "Another test", async () => {}))
    .toMatchSnapshot(`
      Error: Command with name 'test' already exists. Ignoring duplicate.
    `);
});

// Test input handling
test("handles empty input", () => {
  const cli = new CLI();
  expect(async () => await cli.handleInput("")).toMatchSnapshot(
    'Please enter a valid command. Type "--help" for a list of available commands.'
  );
});

test("handles valid commands", async () => {
  const cli = new CLI();
  const mockCommand = jest.fn();
  cli.addCommand("validCommand", "Valid command", mockCommand);
  await cli.handleInput("validCommand");
  expect(mockCommand).toHaveBeenCalled();
});

test("handles unrecognized commands", () => {
  const cli = new CLI();
  expect(async () => await cli.handleInput("invalidCommand")).toMatchSnapshot(
    `Unrecognized command 'invalidCommand'. Type "--help" for a list of available commands.`
  );
});

// Test error handling
test("handles errors during command execution", async () => {
  const cli = new CLI();
  cli.addCommand("errorCommand", "Error command", async () => {
    throw new Error("Test error");
  });
  expect(async () => await cli.handleInput("errorCommand")).toMatchSnapshot(
    `Error executing command 'errorCommand': Test error`
  );
});

// Test start method
test("start listens for user input and handles commands", async () => {
  const cli = new CLI();
  const mockCommand = jest.fn();
  cli.addCommand("validCommand", "Valid command", mockCommand);

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  spyOn(readline, "emit").mockImplementation((event, ...args) => {
    if (event === "line") {
      cli.handleInput(args[0]);
    }
  });

  cli.start();
  readline.emit("line", "validCommand");
  await Promise.resolve(); // Allow async operations to complete

  expect(mockCommand).toHaveBeenCalled();
});
