import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import fs from "node:fs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9333;
const profile = "D:\\code\\resume bulder\\tmp-chrome-profile";

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--no-first-run",
  "--no-default-browser-check",
  "--window-size=1500,1300",
  "--hide-scrollbars",
  "--no-proxy-server",
  "--disable-gpu",
  "about:blank",
]);

let wsUrl = null;
for (let i = 0; i < 50; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const page = list.find((t) => t.type === "page");
    if (page?.webSocketDebuggerUrl) { wsUrl = page.webSocketDebuggerUrl; break; }
  } catch {}
  await sleep(300);
}
if (!wsUrl) { console.error("no devtools endpoint"); chrome.kill(); process.exit(1); }

const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
});
await new Promise((res, rej) => { ws.addEventListener("open", res); ws.addEventListener("error", rej); });

const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const mid = ++id;
    pending.set(mid, { resolve, reject });
    ws.send(JSON.stringify({ id: mid, method, params }));
  });

const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: "http://127.0.0.1:3000" });
await sleep(3000);
for (let i = 0; i < 30; i++) {
  if (await evaluate("!!document.body && document.body.innerText.trim().length > 80")) break;
  await sleep(800);
}

await evaluate("localStorage.setItem('shayan_active_template_id_v1', 'executive-ats-2page')");
await send("Page.reload", { ignoreCache: false });
await sleep(3000);
for (let i = 0; i < 30; i++) {
  if (await evaluate("!!document.querySelector('#page-1 .p1-work')")) break;
  await sleep(600);
}

const measure = await evaluate(`(() => {
  if (!document.querySelector('#page-1')) return { error: 'no #page-1' };
  const rows = [...document.querySelectorAll('#page-1 .p1-work article')].map(a => {
    const logo = a.querySelector('.tpl-company-logo');
    const h3 = a.querySelector('h3');
    if (!logo || !h3) return { skip: true };
    const col = h3.parentElement;
    const sub = h3.nextElementSibling;
    const row = a.querySelector(':scope > div');
    const r = (el) => { const b = el.getBoundingClientRect(); return { top: +b.top.toFixed(2), bottom: +b.bottom.toFixed(2), h: +b.height.toFixed(2) }; };
    return {
      title: h3.textContent.trim().slice(0, 28),
      logo: r(logo), col: r(col), titleBox: r(h3), subBox: r(sub),
      rowPadBottom: getComputedStyle(row).paddingBottom,
      titleVsLogoTop: +(r(h3).top - r(logo).top).toFixed(2),
      subVsLogoBottom: +(r(sub).bottom - r(logo).bottom).toFixed(2),
      colVsLogo: +(r(col).h - r(logo).h).toFixed(2),
    };
  });
  const sheet = document.querySelector('#page-1').getBoundingClientRect();
  const arts = [...document.querySelectorAll('#page-1 .p1-work article')];
  const last = arts[arts.length - 1].getBoundingClientRect();
  return { rows, bottomSlack: +(sheet.bottom - last.bottom).toFixed(2) };
})()`);

const shot = await send("Page.captureScreenshot", { format: "png" });
fs.writeFileSync("tmp-exec-render.png", Buffer.from(shot.data, "base64"));

console.log(JSON.stringify(measure, null, 2));
ws.close();
chrome.kill();
process.exit(0);
