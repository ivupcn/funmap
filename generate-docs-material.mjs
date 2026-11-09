import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Paragraph, TextRun, Header, Footer, AlignmentType, PageNumber, HeadingLevel, Packer, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建段落辅助函数
function createParagraph(text, options = {}) {
  const {
    bold = false,
    size = 24, // 12pt 小四
    font = '宋体',
    alignment = AlignmentType.JUSTIFIED,
    spacing = { line: 360, after: 200 }, // 1.5倍行距
    indent = {},
    heading
  } = options;

  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold,
        size,
        font
      })
    ],
    alignment,
    spacing,
    indent,
    heading
  });
}

// 创建标题
function createHeading(text, level = HeadingLevel.HEADING_1) {
  const sizes = {
    [HeadingLevel.HEADING_1]: 32, // 16pt 三号
    [HeadingLevel.HEADING_2]: 28, // 14pt 四号
    [HeadingLevel.HEADING_3]: 24  // 12pt 小四
  };

  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: true,
        size: sizes[level] || 24,
        font: '黑体'
      })
    ],
    spacing: { before: 300, after: 200, line: 360 },
    heading: level
  });
}

// 创建表格单元格
function createCell(text, options = {}) {
  const { bold = false, width = 2000 } = options;
  
  return new TableCell({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold,
            size: 24,
            font: '宋体'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: 360 }
      })
    ],
    width: { size: width, type: WidthType.DXA }
  });
}

// 创建文档
async function createDocument() {
  const children = [];

  // 封面标题
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'FunMap 手绘地图导览系统 V1.0',
          bold: true,
          size: 44, // 22pt 二号
          font: '黑体'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 600 }
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '文档鉴别材料',
          bold: true,
          size: 36, // 18pt 小二
          font: '黑体'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 4000 }
    })
  );

  // 文档信息
  const infoData = [
    ['软件名称', 'FunMap 手绘地图导览系统 V1.0'],
    ['版本号', 'V1.0'],
    ['开发完成日期', '2026年10月'],
    ['首次发表日期', '2026年10月'],
    ['开发方式', '独立开发']
  ];

  for (const [label, value] of infoData) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${label}：${value}`,
            size: 28, // 14pt
            font: '宋体'
          })
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200, line: 360 }
      })
    );
  }

  // 分页
  children.push(
    new Paragraph({
      children: [],
      pageBreakBefore: true
    })
  );

  // 目录页
  children.push(createHeading('目  录', HeadingLevel.HEADING_1));
  const tocItems = [
    '一、软件概述',
    '二、软件功能模块',
    '三、技术架构',
    '四、运行环境',
    '五、使用说明',
    '六、软件特点'
  ];
  
  for (const item of tocItems) {
    children.push(
      createParagraph(item, {
        size: 28,
        alignment: AlignmentType.LEFT,
        spacing: { after: 300, line: 400 }
      })
    );
  }

  // 分页
  children.push(
    new Paragraph({
      children: [],
      pageBreakBefore: true
    })
  );

  // 一、软件概述
  children.push(createHeading('一、软件概述', HeadingLevel.HEADING_1));
  
  children.push(
    createParagraph(
      'FunMap 手绘地图导览系统是一款专为文旅景区、旅游小镇设计的移动端 H5 地图导览应用。系统以手绘风格地图为底图，集成 POI 兴趣点标注、分类筛选、关键词搜索、语音导览、360°全景查看等功能，为游客提供直观、便捷的自助导览服务。'
    )
  );

  children.push(
    createParagraph(
      '本系统采用前后端分离架构，前端基于 Vue 3 + Vite + Leaflet 技术栈开发，通过 RESTful API 与后端通信。支持运行时动态配置地图参数与 POI 数据，便于快速部署与内容更新，有效降低景区数字化导览系统的开发成本与部署门槛。'
    )
  );

  // 二、软件功能模块
  children.push(createHeading('二、软件功能模块', HeadingLevel.HEADING_1));

  children.push(createHeading('2.1 地图展示模块', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）手绘地图加载：系统支持以手绘风格地图作为底图，通过自定义坐标系（EPSG4326）实现手绘图与 Leaflet 地图引擎的精确对齐。'
    )
  );
  children.push(
    createParagraph(
      '（2）多级别缩放：支持 0-18 级缩放，用户可通过双指捏合手势自由缩放地图，查看不同精度的地图细节。'
    )
  );
  children.push(
    createParagraph(
      '（3）平滑拖拽：支持单指拖拽操作，地图响应流畅，无卡顿现象。'
    )
  );

  children.push(createHeading('2.2 POI 管理模块', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）兴趣点标注：在地图上标注景点、美食、住宿、购物等多类别 POI，每个 POI 包含名称、分类、简介、坐标等信息。'
    )
  );
  children.push(
    createParagraph(
      '（2）分类筛选：底部 Tab 栏提供分类切换功能，用户可快速筛选特定类别的 POI。'
    )
  );
  children.push(
    createParagraph(
      '（3）详情查看：点击 POI 标记可查看详细信息，包括名称、分类、简介、语音讲解等。'
    )
  );

  children.push(createHeading('2.3 搜索模块', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）关键词搜索：支持 POI 名称模糊搜索，输入关键词即可快速定位目标位置。'
    )
  );
  children.push(
    createParagraph(
      '（2）搜索结果展示：搜索结果以列表形式展示，点击结果项可跳转至对应 POI 详情页。'
    )
  );

  children.push(createHeading('2.4 语音导览模块', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）语音播放：集成音频播放功能，支持 POI 语音讲解，游客可边看边听。'
    )
  );
  children.push(
    createParagraph(
      '（2）播放控制：提供播放、暂停、进度条拖拽等基础控制功能。'
    )
  );

  children.push(createHeading('2.5 全景查看模块', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）360°全景浏览：集成 photo-sphere-viewer，支持全景图片的 360°查看。'
    )
  );
  children.push(
    createParagraph(
      '（2）手势交互：支持单指拖拽旋转视角，双指缩放调整视野。'
    )
  );
  children.push(
    createParagraph(
      '（3）陀螺仪支持：移动端设备可通过陀螺仪感应设备姿态，实现沉浸式全景浏览。'
    )
  );

  // 三、技术架构
  children.push(createHeading('三、技术架构', HeadingLevel.HEADING_1));

  children.push(createHeading('3.1 前端架构', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）Vue 3 Composition API：采用 Vue 3 最新的组合式 API，实现逻辑复用与响应式数据管理。'
    )
  );
  children.push(
    createParagraph(
      '（2）Pinia 状态管理：使用 Pinia 替代 Vuex，提供更简洁的 API 和更好的 TypeScript 支持。'
    )
  );
  children.push(
    createParagraph(
      '（3）Vue Router：实现单页应用的路由管理，支持页面切换与参数传递。'
    )
  );

  children.push(createHeading('3.2 地图引擎', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）Leaflet：开源的移动端地图库，轻量、高性能，支持丰富的插件生态。'
    )
  );
  children.push(
    createParagraph(
      '（2）自定义坐标系：基于 EPSG4326 坐标系，实现手绘地图与瓦片金字塔的精确对齐。'
    )
  );

  children.push(createHeading('3.3 构建工具', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）Vite：新一代前端构建工具，基于 ES Module，支持热模块替换（HMR），开发效率提升 50% 以上。'
    )
  );
  children.push(
    createParagraph(
      '（2）按需导入：使用 unplugin-vue-components 实现 Vant 组件自动导入，减少打包体积。'
    )
  );

  children.push(createHeading('3.4 UI 组件库', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）Vant：轻量、可靠的移动端组件库，提供丰富的组件和完善的文档。'
    )
  );

  // 四、运行环境
  children.push(createHeading('四、运行环境', HeadingLevel.HEADING_1));

  children.push(createHeading('4.1 开发环境', HeadingLevel.HEADING_2));
  
  const devEnvTable = new Table({
    rows: [
      new TableRow({
        children: [
          createCell('项目', { bold: true, width: 3000 }),
          createCell('要求', { bold: true, width: 5000 })
        ]
      }),
      new TableRow({
        children: [
          createCell('操作系统', { width: 3000 }),
          createCell('macOS 12.0 及以上', { width: 5000 })
        ]
      }),
      new TableRow({
        children: [
          createCell('开发工具', { width: 3000 }),
          createCell('Visual Studio Code', { width: 5000 })
        ]
      }),
      new TableRow({
        children: [
          createCell('运行时环境', { width: 3000 }),
          createCell('Node.js v18.0+', { width: 5000 })
        ]
      }),
      new TableRow({
        children: [
          createCell('包管理器', { width: 3000 }),
          createCell('npm', { width: 5000 })
        ]
      })
    ],
    width: { size: 8000, type: WidthType.DXA }
  });
  
  children.push(devEnvTable);

  children.push(createHeading('4.2 运行环境', HeadingLevel.HEADING_2));
  
  const runEnvTable = new Table({
    rows: [
      new TableRow({
        children: [
          createCell('项目', { bold: true, width: 3000 }),
          createCell('要求', { bold: true, width: 5000 })
        ]
      }),
      new TableRow({
        children: [
          createCell('硬件设备', { width: 3000 }),
          createCell('智能手机（iOS/Android/HarmonyOS）', { width: 5000 })
        ]
      }),
      new TableRow({
        children: [
          createCell('操作系统', { width: 3000 }),
          createCell('iOS 13.0+ / Android 8.0+ / HarmonyOS 3.0+', { width: 5000 })
        ]
      }),
      new TableRow({
        children: [
          createCell('浏览器', { width: 3000 }),
          createCell('Safari 13.0+ / Chrome 80.0+ / 华为浏览器 13.0+', { width: 5000 })
        ]
      }),
      new TableRow({
        children: [
          createCell('网络环境', { width: 3000 }),
          createCell('支持 HTTP/HTTPS 协议', { width: 5000 })
        ]
      })
    ],
    width: { size: 8000, type: WidthType.DXA }
  });
  
  children.push(runEnvTable);

  // 五、使用说明
  children.push(createHeading('五、使用说明', HeadingLevel.HEADING_1));

  children.push(createHeading('5.1 安装与部署', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）环境准备：安装 Node.js v18.0+ 和 npm。'
    )
  );
  children.push(
    createParagraph(
      '（2）依赖安装：在项目根目录执行 npm install 安装所有依赖。'
    )
  );
  children.push(
    createParagraph(
      '（3）开发启动：执行 npm run dev 启动开发服务器，默认端口 5173。'
    )
  );
  children.push(
    createParagraph(
      '（4）生产构建：执行 npm run build 生成生产环境代码，输出至 dist 目录。'
    )
  );
  children.push(
    createParagraph(
      '（5）部署上线：将 dist 目录上传至任意 Web 服务器或 CDN 即可。'
    )
  );

  children.push(createHeading('5.2 功能操作', HeadingLevel.HEADING_2));
  children.push(
    createParagraph(
      '（1）地图浏览：打开应用后自动加载手绘地图，支持单指拖拽、双指缩放。'
    )
  );
  children.push(
    createParagraph(
      '（2）POI 筛选：点击底部 Tab 栏切换不同类别（景点、美食、住宿、购物等）。'
    )
  );
  children.push(
    createParagraph(
      '（3）POI 查看：点击地图上的 POI 标记，弹出详情面板，可查看名称、简介、语音讲解。'
    )
  );
  children.push(
    createParagraph(
      '（4）搜索功能：点击顶部搜索框，输入关键词，系统实时过滤匹配的 POI。'
    )
  );
  children.push(
    createParagraph(
      '（5）全景浏览：在 POI 详情页点击全景入口，进入 360°全景查看器，支持手势旋转与缩放。'
    )
  );

  // 六、软件特点
  children.push(createHeading('六、软件特点', HeadingLevel.HEADING_1));

  children.push(
    createParagraph(
      '（1）轻量化部署：纯前端静态资源，无需后端依赖，可通过 CDN 或任意 Web 服务器部署，部署成本极低。'
    )
  );

  children.push(
    createParagraph(
      '（2）运行时配置：地图参数与 POI 数据通过 JSON 配置文件管理，支持不重新构建即可更新内容，运营维护便捷。'
    )
  );

  children.push(
    createParagraph(
      '（3）移动端优化：针对触摸交互深度优化，解决双指缩放灵敏度问题，支持手势缩放与拖拽，用户体验流畅。'
    )
  );

  children.push(
    createParagraph(
      '（4）手绘风格集成：创新性地将手绘风格地图与 Leaflet 地图引擎结合，通过自定义坐标系实现精确对齐，视觉效果独特。'
    )
  );

  children.push(
    createParagraph(
      '（5）功能模块化：地图展示、POI 管理、搜索、语音导览、全景查看等功能模块独立，便于扩展与维护。'
    )
  );

  children.push(
    createParagraph(
      '（6）高性能构建：基于 Vite 构建，开发环境启动速度快，生产环境打包体积小，加载性能优异。'
    )
  );

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 2.5cm
            right: 1440,
            bottom: 1440,
            left: 1440
          },
          size: {
            width: 11906, // A4
            height: 16838
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'FunMap 手绘地图导览系统 V1.0 - 文档鉴别材料',
                  size: 18,
                  font: '宋体'
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: '第 ',
                  size: 18,
                  font: '宋体'
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 18,
                  font: '宋体'
                }),
                new TextRun({
                  text: ' 页',
                  size: 18,
                  font: '宋体'
                })
              ],
              alignment: AlignmentType.CENTER
            })
          ]
        })
      },
      children: children
    }]
  });

  return doc;
}

// 主函数
async function main() {
  console.log('正在生成文档鉴别材料...');
  const doc = await createDocument();
  
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'FunMap手绘地图导览系统V1.0_文档鉴别材料.docx');
  
  fs.writeFileSync(outputPath, buffer);
  console.log(`文档已生成: ${outputPath}`);
  console.log(`文件大小: ${(buffer.length / 1024).toFixed(2)} KB`);
}

main().catch(err => {
  console.error('生成失败:', err);
  process.exit(1);
});
