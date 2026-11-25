# 第三方素材与依赖

Kenney 素材来自下列官方资源页。PNG 和 Ogg 文件随应用打包，每个素材包的原始许可文本同目录保存。六个采用的素材包均为 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)。

| 来源 | 文件和用途 |
| --- | --- |
| [Tiny Town 1.1](https://kenney.nl/assets/tiny-town) | `Tiles/tile_*.png`，冒险岛植物和区域建筑 |
| [UI Pack 2.0](https://kenney.nl/assets/ui-pack) | `PNG/Yellow/Double/star.png`，奖励星和区域勋章 |
| [Platformer Art Deluxe](https://kenney.nl/assets/platformer-art-deluxe) | `Base pack/Player/p3_front.png`、`p3_jump.png` 和 `Base pack/Items/coinGold.png`，冒险伙伴与金币 |
| [Cartography Pack](https://kenney.nl/assets/cartography-pack) | `PNG/Retina/chest.png`，区域宝箱 |
| [UI Audio](https://kenney.nl/assets/ui-audio) | `Audio/switch7.ogg`，正确反馈 |
| [RPG Audio](https://kenney.nl/assets/rpg-audio) | `Audio/handleCoins.ogg`，完成练习的音效 |

- [ts-fsrs 5.4.2](https://github.com/open-spaced-repetition/ts-fsrs) 使用 MIT 许可。该版本支持 Node.js 20 及以上，兼容本项目的 Node.js 22 构建环境。复习算法作为 TypeScript 前端逻辑运行。
- [Motion 12.43.0](https://github.com/motiondivision/motion) 及其 Motion 子包使用 MIT 许可。本项目的 React 19 满足版本要求，动画使用 `LazyMotion` 的 DOM 功能集。
- 同目录保留主要运行依赖对应发行包的许可，具体版本以仓库的 `package-lock.json` 为准。
- 参考核对了 [Phaser](https://github.com/phaserjs/phaser)（MIT）、[Kotoba Learn](https://github.com/codegeasse1/kotoba-learn)（MIT）与 [Anki](https://github.com/ankitects/anki/blob/main/LICENSE)（主体为 AGPL 3.0）。地图由 React 和 CSS 实现，课程内容独立编写，复习算法来自 ts-fsrs。
