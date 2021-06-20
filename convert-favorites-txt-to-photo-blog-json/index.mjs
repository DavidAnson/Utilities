import { mkdir, readdir, readFile, writeFile } from "fs/promises";
import { basename, resolve } from "path";
import { argv, exit } from "process";

// Constants and helpers
const millisecondsPerDay = 1000 * 60 * 60 * 24;
const postNameRe = /^(\d{4})(\d{2})(\d{2})\.json$/;
const toLines = (s) => s.split(/\r\n|\r|\n/g);
const toPostDateString = (d) => `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`
const toJsonDateString = (s) => `${s}T12:00Z`;
const toInt = (s) => parseInt(s, 10);

// Command line arguments
const [ , , site, favorites ] = argv;
if (!site || !favorites) {
  console.error(`Syntax: ${basename(argv[1])} path-to-site-directory path-to-favorites-directory`);
  exit(1);
}
const siteAbs = resolve(site);
const favoritesAbs = resolve(favorites);

// Determine post date
let postDateMs = Date.now();
const entries = await readdir(resolve(siteAbs, "posts"));
for (const entry of entries) {
  const [ , year, month, day ] = postNameRe.exec(entry) || [];
  if (year && month && day) {
    const entryDate = new Date(toInt(year), toInt(month) - 1, toInt(day));
    postDateMs = Math.max(postDateMs, entryDate.valueOf());
  }
}

// Create content directory
const postDateString = toPostDateString(new Date(postDateMs + millisecondsPerDay));
const postId = postDateString.replaceAll("-", "");
await mkdir(resolve(siteAbs, "static", "blog", postId), { "recursive": true });

// Get Favorites metadata
const postMetadata = basename(favoritesAbs);
const [ , contentDateString, title ] = /^(\d{4}-\d{2}-\d{2})[a-z]? - (.+) \(.+\)$/.exec(postMetadata) || [];
if (!contentDateString || !title) {
  console.error(`Malformed directory name: ${postMetadata}`);
  exit(1);
}

// Parse Favorites file
const contentJsonArray = [];
const fileContent = await readFile(resolve(favoritesAbs, "Favorites.txt"), "utf8");
for (const line of toLines(fileContent)) {
  if (line.trim().length > 0) {
    const [ , image, caption ] = /^"([^"]+)"(.*)$/.exec(line) || [];
    if (!image) {
      console.error(`Malformed Favorites line: ${line}`);
      exit(1);
    }
    if (caption) {
      contentJsonArray.push({
        "image": `${postId}/${image.replace(/(\.HEIC\.jpg|\.jpe?g|\.CRW)$/i, ".jpg")}`,
        "caption": caption.trim()
      });
    }
  }
}

// Write post JSON
const postJson = {
  title,
  "publishDate": toJsonDateString(postDateString),
  "contentDate": toJsonDateString(contentDateString),
  contentJson: contentJsonArray
};
const postString = JSON.stringify(postJson, null, 2);
await writeFile(resolve(siteAbs, "posts", `${postId}.json`), postString, "utf8");

// Show output
console.log(postString);
