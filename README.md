# 英语奇遇 · English Adventure AI

基于 React、TypeScript 和 Capacitor 的英语学习应用。课程内容随应用提供，安卓端使用 SQLite 保存学习记录，网页版使用浏览器本地存储。

## v0.4.2 · 冒险地图

- 本阶段提供 35 关、140 道题，分布在 9 个区域。课程涵盖日常口语、外贸英语、语法和综合实战，包括机场、展会、超细纤维毛巾、外箱包装、出货文件和交货延期。
- 地图可以自由探索，也会提示最近未完成的关卡。首次掌握一题得 10 经验，完整通关得 5 金币，完成区域获得勋章、宝箱和额外 15 金币。成就页会汇总进度。
- 每个页面顶部都有英文朗读框。课程例句、题干、选项和参考答案中的英文单词可点击朗读。
- 每课有例句朗读、选择、听力、拼写和跟读。跟读按系统识别出的文本判题，支持手动输入。
- 课前例句页和答题页可开关英文下方的中文翻译，默认关闭并记住上次选择。
- 答对后自动进入下一题。答错后可查看参考答案并重试，也可以继续下一题。设置里可关闭界面动画或打开答题音效。
- 复习营地用 ts-fsrs 按答题历史计算到期时间，每轮最多 12 题。错题本也支持随时重练，答对后会移出错题本，仍可按计划复习。
- Android SQLite 由版本 1 升级至版本 2，新增可空的答题时间列。原有记录仍按原顺序读取，缺少时间的记录按当日当地零点参与排程。
- 学习首页优先返回最近练过且尚未完成的课程。课程详情可继续未掌握的题，也可重练整课。
- Windows Ollama 支持填写服务地址和在线检测。练习可独立运行。
- Android 本地 AI 预留 Provider 接口，设置中显示「尚未启用」。

目标课程规模为 1000 关。本版包含 5 关网站英语，涵盖设置、网络状态、服务、查询、连接、规则、日志与测试。[素材和依赖许可](public/licenses/README.md)

## 在浏览器开发

需要 Node.js 22.12+ 和 npm。

```sh
npm ci
npm test
npm run build
npm run dev
```

## 构建 Android 调试 APK

准备 JDK 21、Android SDK Platform 35 和 Android Build Tools。把 Android SDK 路径设为 `ANDROID_HOME`，或在 `android/local.properties` 配置 `sdk.dir`。

```sh
npm run android:sync
cd android
./gradlew assembleDebug
```

Windows PowerShell 使用 `.\gradlew.bat assembleDebug`。APK 位于 `android/app/build/outputs/apk/debug/app-debug.apk`。GitHub Actions 提供同一构建流程与调试 APK 下载。

将调试 APK 安装到 Android 6.0 或更新版本。用原安装的签名密钥构建时可以覆盖升级并保留进度。CI 与本地可能使用不同的调试签名，Android 会拒绝用不同签名覆盖安装。

## 语音和 Ollama

- 安卓朗读使用系统英语语音包。跟读优先使用 Android 的设备端语音识别服务，也可通过手机的默认识别服务或系统语音界面。使用时按提示允许麦克风权限。可用性和离线能力取决于手机的识别服务与英文语音包。系统默认服务可能联网。
- Windows Ollama 如需让手机访问，应在可信网络内监听可访问的地址，在应用里填写例如 `http://192.168.1.20:11434`。检测仅请求 `GET /api/tags`。浏览器测试时需要服务允许该页面的来源。应用不需要配置 API 密钥。
