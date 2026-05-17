// scripts/compress-for-s3.js
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");

const files = [];

function walkDir(dirPath) {
	fs.readdirSync(dirPath, { withFileTypes: true }).forEach((file) => {
		const filePath = path.join(dirPath, file.name);
		if (file.isDirectory()) {
			walkDir(filePath);
		} else if ([".js", ".css", ".json", ".html", ".svg"].includes(path.extname(file.name))) {
			files.push(filePath);
		}
	});
}

walkDir(path.join(__dirname, "../out"));

let compressedCount = 0;

files.forEach((filePath) => {
	const gzipPath = filePath + ".gz";
	fs.createReadStream(filePath)
		.pipe(zlib.createGzip({ level: 9 }))
		.pipe(fs.createWriteStream(gzipPath))
		.on("finish", () => {
			fs.unlinkSync(filePath);
			console.log(`Compressed and deleted: ${filePath}`);
			compressedCount++;
			if (compressedCount === files.length) {
				console.log(`\n✓ Compression complete! ${files.length} files compressed.`);
			}
		});
});
