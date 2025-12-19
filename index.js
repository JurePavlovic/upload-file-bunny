const fs = require("fs");
const path = require("path");
const tus = require("tus-js-client");

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : (process.argv[i + 1] ?? null);
}

const filePath = arg("--file");
const initPath = arg("--init");

if (!filePath || !initPath) {
  console.error(
    "Usage: node upload.js --file /path/video.mp4 --init /path/tus-init.json",
  );
  process.exit(1);
}

const init = JSON.parse(fs.readFileSync(initPath, "utf8"));
const stat = fs.statSync(filePath);

if (!init?.endpoint || !init?.headers || !init?.videoId) {
  console.error(
    "Init JSON must include: endpoint, headers, videoId (and usually expireAt).",
  );
  process.exit(1);
}

const stream = fs.createReadStream(filePath);

const upload = new tus.Upload(stream, {
  endpoint: init.endpoint,
  headers: init.headers,
  uploadSize: stat.size,
  metadata: {
    filename: path.basename(filePath),
    filetype: "video/mp4",
  },
  retryDelays: [0, 3000, 5000, 10000, 20000, 60000],
  onProgress(uploaded, total) {
    const pct = total ? ((uploaded / total) * 100).toFixed(2) : "0.00";
    process.stdout.write(`\rUploading ${pct}% (${uploaded}/${total})`);
  },
  onError(err) {
    console.error("\nUpload failed:", err?.message || err);
    process.exit(1);
  },
  onSuccess() {
    console.log(`\nUpload complete. Bunny videoId=${init.videoId}`);
    console.log("TUS upload URL:", upload.url);
  },
});

upload.start();
