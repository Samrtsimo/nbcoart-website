# COART Sculpture & Art Studio — nbcoart.com

**网址**: https://www.nbcoart.com<br>
**部署平台**: GitHub Pages（免费，SSL 自动）<br>
**本地路径**: `e:\DavidSkills\网站建设\nbcoart.com网站建设\site\`

宁波和艺建筑材料有限公司的艺术站（雕塑 / 艺术家具 / 艺术门）。
品牌标语：*the inspiration is always from nature*

> 与建材站 https://www.coartbm.com 是同一家公司：
> - coartbm.com = 建材站（金属门/铝窗/SPC地板/PU等）
> - nbcoart.com = **雕塑艺术站**（金属/玻璃钢/石/蜡像/木/灯彩雕塑 + 艺术家具 + 艺术门）

## 公司信息

| 项目 | 内容 |
|------|------|
| 公司 | Ningbo Coart Building Material Co., Ltd |
| 联系人 | 陈胜 (David Chen) |
| 手机/微信/WhatsApp | +86 135 6693 0986 |
| 邮箱 | davidchensimo@foxmail.com |
| 地址 | No. 49, XingYu New Village, Jingshanzhong Road, Yinzhou Zone, Ningbo, Zhejiang, China 315000 |
| 服务 | 与艺术家合作 3D 设计 · 工厂对接 · 定制生产 · 质量检验 · 海运/空运交付 |

## 网站结构（21 页，纯英文，现代艺术风格）

| 页面 | 内容 |
|------|------|
| `index.html` | 首页：Hero 轮播 + 品牌语 + 简介(实拍图轮播) + 精选雕塑 + 服务 + 新闻 + CTA |
| `products.html` | 7 大分类总览 + 电子画册下载区 |
| `{category}.html` × 7 | 每类产品的图库（型号 + 价格 + 询价）；金属页带 6 子分类筛选 |
| `original-design.html` | 原创设计（独立一级导航）|
| `news.html` | 新闻 list（7 篇，可点进详情）|
| `{id}-article.html` × 7 | 新闻/项目详情页（标题 + 日期 + 配图）|
| `catalogue.html` | 电子画册下载（独立一级导航）|
| `about.html` | 公司简介 + David Chen |
| `contact.html` | 联系方式 + Web3Forms 询盘表单 |

## 7 类雕塑产品（78 款；2026-08 移除 Art Door 系列，补齐 Metal 子分类）

| 分类 | 数量 |
|------|------|
| Metal Sculpture 金属雕塑 | 49（6 子分类：不锈钢28/铜青铜5/耐候钢4/灯光3/喷泉5/火焰4）|
| Fiberglass Sculpture 玻璃钢 | 8 |
| Stone Sculpture 石雕 | 1 |
| Wax & Silicone 蜡像硅胶 | 1 |
| Wood Sculpture 木雕 | 2 |
| Light Lantern Sculpture 灯彩 | 3 |
| Art Furniture 艺术家具 | 8 |
| Original Design 原创设计 | 6 |

## 电子画册下载

- `assets/catalogues/Coart-Sculpture-Catalogue-2026.pdf`（24.3 MB，2026 版）
- 下载入口：`products.html` 的 "Browse the full COART e-catalogue" 区 + 每页页脚 "E-Catalogue"

## 技术要点

- **纯静态站**（HTML + CSS + JS），零后台、零服务器，域名除外全部免费
- **数据驱动**：`data/products.js` → 产品卡/分类总览由 `js/main.js` 渲染（同 coartbm 模式）
  加一款产品 → 改 `data/products.js`，或重跑构建脚本 `tools/build_pages.py`
- **图片**：从原站下载（2560px 高清，共享同公司素材，无需去水印）
- **询盘**：Web3Forms（Access Key 在 `js/main.js`，收件同 davidchensimo@gmail.com）
  + 每个产品卡 "Get Price" → 直接打开 WhatsApp 带产品名
- **视觉**：深炭色 + 品牌青柠绿 #cfea43（Coart logo 取色）+ Cormorant Garamond/Inter 字体
- **响应式**：桌面 / 平板 / 手机

## 部署（GitHub Pages）

仓库：`samrtsimo/nbcoart-website` ｜ CNAME → www.nbcoart.com

更新流程：
1. 编辑 `site/` 下文件
2. `cd site && git add . && git commit -m "msg" && git push`
3. 1-2 分钟自动生效

**★ 上线切换（重要）**：阿里云 DNS 上 `www` 目前仍解析到 速成美站，本新站对现网站零影响（预览：
`https://samrtsimo.github.io/nbcoart-website/`）。速成美站到期后，只需在阿里云把 `www` 记录的
CNAME 改为 `samrtsimo.github.io`，GitHub 自动签发 Let's Encrypt SSL（不再需要每 3 个月手动更新）。
详见《一键上线手册.md》。

## 设计规范

- 主色 `#cfea43`（品牌青柠绿）· 背景 `#111318` · 文字 `#eef1f4`
- 展示字体 Cormorant Garamond（衬线，品牌语/标题）· 正文 Inter
