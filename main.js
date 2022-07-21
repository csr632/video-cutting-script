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
  for await (const [index, oneSliceData] of sliceData.slice(0, 2).entries()) {
    await oneSlice(oneSliceData, index, sliceData.length);
  }
  // await merge()
})();

function oneSlice(oneSliceData, index, totalNum) {
  return new Promise((success, fail) => {
    const logPrefix = `[${index + 1}/${totalNum}] `;
    const desc = `${index} - ${oneSliceData.c}`;
    ffmpeg(inputVideoPath, { stdoutLines: 1000 })
      .setStartTime(oneSliceData.s)
      .setDuration(oneSliceData.d)
      .videoFilters({
        filter: "drawtext",
        options: {
          text: desc,
          fontfile: path.join(__dirname, "SourceHanSansCN-Regular.ttf"),
          fontsize: "36",
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
  const videoStitch = require("video-stitch");
  const videoConcat = videoStitch.concat;

  return new Promise((success, fail) => {
    videoConcat({ silent: false, overwrite: true })
      .clips(
        sliceData.map((oneSliceData, index) => {
          return {
            fileName: getPathForSlice(index),
          };
        })
      )
      .output(outputVideoPath)
      .concat()
      .then((outputFileName) => {
        console.error("merge done:", outputFileName);
        success();
      })
      .catch((err) => {
        console.error("merge err:");
        console.error(err);
        fail();
      });
  });
}

function getPathForSlice(index) {
  return path.resolve(outputDir, `split${index}.mp4`);
}
