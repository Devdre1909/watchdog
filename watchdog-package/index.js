#!/usr/bin/env node

import os from "os";
import psList from "ps-list";
import http from "http";
import express from "express";
import io from "socket.io-client";
import minimist from "minimist";
import { createSpinner } from "nanospinner";

const spinner = createSpinner("Loading...").start();

const app = express();
const server = http.createServer(app);
const socket = io("http://localhost:3002/");

socket.on("connect", () => {
  spinner.success({
    text: "Connected to server",
  });
});

const args = minimist(process.argv.slice(2));

const interval = args.i || args.interval || 5000;

const osInfo = {
  hostname: os.hostname(),
  platform: os.platform(),
  arch: os.arch(),
  release: os.release(),
  uptime: os.uptime(),
  cpu: os.cpus(),
  totalMemory: convertToGB(os.totalmem()),
};

const computerID = generateComputerID();

const payload = {
  computerID: computerID,
  osInfo,
};

socket.emit("os_info", payload);

spinner.success({
  text: `First event sent; Open https://localhost:3000/${computerID}`,
});

setInterval(async () => {
  spinner.start({
    text: "Sending event...",
  });

  const payload = {
    computerID: computerID,
    osInfo: {
      memory: processMemory(os.freemem()),
      processes: await getProcessList(),
    },
  };

  socket.emit("os_info", payload);
  spinner.success({
    text: "Event sent",
  });
}, interval);

function convertToGB(bytes) {
  return bytes / (1024 * 1024 * 1024);
}

function processMemory(bytes) {
  return Number(convertToGB(bytes).toFixed(2));
}

function generateComputerID() {
  return Math.random().toString(36).substring(7);
}

async function getProcessList() {
  const list = await psList();
  return {
    sortCpu: list.sort((a, b) => b.cpu - a.cpu).slice(0, 5),
    sortMemory: list.sort((a, b) => b.memory - a.memory).slice(0, 5),
  };
}
