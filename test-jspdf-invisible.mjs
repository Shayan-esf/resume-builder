import { jsPDF } from "jspdf";

const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });
pdf.setFontSize(10);
pdf.setTextColor(255, 255, 255);
pdf.text("Invisible overlay AI test", 10, 20, { renderingMode: "invisible" });
const raw = pdf.output("arraybuffer");
console.log("bytes:", raw.byteLength);
const bytes = new Uint8Array(raw);
let text = "";
for (let i = 0; i < bytes.length; i++) text += String.fromCharCode(bytes[i]);
console.log("has 'Tr' operator:", /(\b3\s+Tr\b)/.test(text));
const m = text.match(/\d+(\.\d+)?\s+Tr/g);
console.log("Tr ops:", m);
console.log("has ' rg':", /255\s+255\s+255\s+rg/.test(text));
