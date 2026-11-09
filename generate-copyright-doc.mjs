import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, Paragraph, TextRun, Header, Footer, AlignmentType, PageNumber, BorderStyle, Packer } from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取所有源码文件
function readSourceFiles(srcDir) {
  const files = [];
  
  function traverse(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (/\.(vue|js|css)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relativePath = path.relative(srcDir, fullPath);
        files.push({
          path: relativePath,
          content: content
        });
      }
    }
  }
  
  traverse(srcDir);
  return files.sort((a, b) => a.path.localeCompare(b.path));
}

// 创建文档
async function createDocument() {
  const srcDir = path.join(__dirname, 'src');
  const sourceFiles = readSourceFiles(srcDir);
  
  const children = [];
  
  // 添加标题
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'FunMap 手绘地图导览系统 V1.0',
          bold: true,
          size: 32, // 16pt
          font: '黑体'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );
  
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '程序鉴别材料',
          bold: true,
          size: 28, // 14pt
          font: '黑体'
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 }
    })
  );
  
  // 添加所有源码文件
  for (let i = 0; i < sourceFiles.length; i++) {
    const file = sourceFiles[i];
    
    // 文件路径标题
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `// 文件: ${file.path}`,
            bold: true,
            size: 20, // 10pt
            font: '等线'
          })
        ],
        spacing: { before: 200, after: 100 },
        border: {
          bottom: {
            color: '000000',
            space: 1,
            style: BorderStyle.SINGLE,
            size: 6
          }
        }
      })
    );
    
    // 文件内容 - 按行分割，过滤空行
    const lines = file.content.split('\n').filter(line => line.trim() !== '');
    for (const line of lines) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: line,
              size: 20, // 10pt (五号)
              font: '等线'
            })
          ],
          spacing: { line: 276 } // 1.15倍行距
        })
      );
    }
  }
  
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1134, // 2.0cm
            right: 1134,
            bottom: 1134,
            left: 1134
          },
          size: {
            width: 11906, // A4: 21cm
            height: 16838  // A4: 29.7cm
          }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'FunMap 手绘地图导览系统 V1.0',
                  size: 18, // 9pt
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
  console.log('正在生成程序鉴别材料...');
  const doc = await createDocument();
  
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(__dirname, 'FunMap手绘地图导览系统V1.0_程序鉴别材料.docx');
  
  fs.writeFileSync(outputPath, buffer);
  console.log(`文档已生成: ${outputPath}`);
  console.log(`文件大小: ${(buffer.length / 1024).toFixed(2)} KB`);
}

main().catch(err => {
  console.error('生成失败:', err);
  process.exit(1);
});
