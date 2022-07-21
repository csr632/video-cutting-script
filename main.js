"use strict";

const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs-extra");

// 手动设置ffmpeg的executable路径
// Ffmpeg.setFfmpegPath(path)

// 需要在这个文件定义要截取的视频片段
const { sliceData } = require("./sliceData");

// 原始视频的路径
const inputVideoPath = path.resolve(__dirname, "./original.mp4");
// 片段的文件夹路径
const outputDir = path.resolve(__dirname, "./tmp");
fs.ensureDirSync(outputDir);
// 合并后视频的路径
const outputVideoPath = path.resolve(__dirname, "./merged.mp4");

(async function main() {
  // 可以注释掉其中某几行，分别执行切分与合并
  for await (const [index, oneSliceData] of sliceData.entries()) {
    await oneSlice(oneSliceData, index, sliceData.length);
  }
  await merge();
})();

function oneSlice(oneSliceData, index, totalNum) {
  return new Promise((success, fail) => {
    const logPrefix = `[${index + 1}/${totalNum}] `;
    const desc = `${index} - ${oneSliceData.c}`;
    console.log(`${logPrefix} Conversion start...... ${desc}`);
    ffmpeg(inputVideoPath, { stdoutLines: 1000 })
      .setStartTime(oneSliceData.s)
      .setDuration(oneSliceData.d)
      .videoFilters({
        filter: "drawtext",
        options: {
          text: desc,
          fontfile: path.join(__dirname, "SourceHanSansCN-Regular.ttf"),
          fontsize: "32",
          x: "10",
          y: "h-th-10",
        },
      })
      .output(getPathForSlice(index))
      .on("error", function (err, stdout, stderr) {
        console.error(`${logPrefix} Conversion error: ${desc}`);
        console.error(err);
        console.error("-".repeat(20) + "stderr:");
        console.error(stderr);
        console.error("-".repeat(20) + "stderr end.");
        fail();
      })
      .on("end", function (stdout, stderr) {
        console.log(`${logPrefix} Conversion done: ${desc}`);
        success();
      })
      .run();
  });
}

function merge() {
  console.log("Merge start");
  return new Promise((success, fail) => {
    const task = ffmpeg();
    sliceData.forEach((oneSliceData, index) => {
      const slicePath = getPathForSlice(index);
      task.mergeAdd(slicePath);
    });
    task
      .on("error", function (err) {
        console.error("Merge error: " + err.message);
        fail(err);
      })
      .on("end", function () {
        console.log("Merging finished!");
        success();
      })
      .mergeToFile(outputVideoPath, path.resolve(__dirname, "./tmp2"));
  });
}

function getPathForSlice(index) {
  return path.resolve(outputDir, `split${index}.mp4`);
}
