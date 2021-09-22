import { RunnerResult } from 'lighthouse/types/externs';
import axios from 'axios';
import { Launcher } from 'chrome-launcher';
import { connect } from 'puppeteer-core';
import lighthouse from 'lighthouse/lighthouse-core';

const url = 'https://www.google.com';
const chromePath = '\\chromium\\chrome.exe'; // or usually /usr/bin/chromium-browser

async function start() {
  const chrome = new Launcher({
    chromePath,
    chromeFlags: ['--no-sandbox', '--disable-dev-shm-usage', '--headless', 'in-process-gpu'], // param solution from this thread
    logLevel: 'info'
  });

  await chrome.launch();
  await chrome.waitUntilReady();
  const details = await axios.get(`http://localhost:${chrome.port}/json/version`);
  const browser = await connect({
    browserWSEndpoint: details.data.webSocketDebuggerUrl, // puppeteer consume the debugger url
  });
  const options = { logLevel: 'info', hostname: 'localhost', port: new URL(browser.wsEndpoint()).port };
  const runnerResult: RunnerResult = await lighthouse(url, options);
  // do some data processing with runnerResult
  console.log(runnerResult.lhr);

  // later on
  browser.close();
}

start();
