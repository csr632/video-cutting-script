# 视频剪切合并脚本

1. 安装[Node.js](https://nodejs.org/)和[FFmpeg](https://ffmpeg.org/download.html).
   > 可以自己在网上搜索你的操作系统对应的安装方式，一般就 2 行命令。
2. `git clone`这个项目到你的本地。
3. 在这个项目文件夹下执行命令`npm install`，安装依赖。
4. 将原视频移动到这个项目文件夹，命名为`original.mp4`。
5. 编辑`sliceData.js`文件，定义你要截取原视频中的哪些片段。
6. 在这个项目文件夹下执行命令`node ./main.js`。
7. 等待执行完成。`tmp`文件夹包含截取出来的片段，`merged.mp4`就是合并结果。
