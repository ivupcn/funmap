/**
 * 手绘地图瓦片生成脚本（CRS.Simple 像素坐标系）
 * 用法: node scripts/generate-tiles-leaflet.js
 *
 * 原理：
 * - 使用 Leaflet 标准 CRS.Simple 像素坐标系（带 y-flip）
 * - 将图片 pad 为正方形后按标准瓦片金字塔切割
 * - 瓦片 y 轴翻转：文件 ty=0 对应图像底部（匹配 CRS.Simple 的 y-flip 约定）
 * - 保证每片瓦片内容区域与 Leaflet 定位区域一致，零形变
 * - 配置驱动：读取 src/data/mock.js 中的 mapConfig 获取图片路径和输出路径
 */
import sharp from 'sharp'
import { mkdirSync, existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// ===== 读取配置（从 mock 数据）=====
const { mapConfig } = await import(join(ROOT, 'src/data/mock.js'))
const config = mapConfig

const SOURCE = join(ROOT, 'public', config.image.replace(/^\//, ''))
const OUTPUT = join(ROOT, 'public', config.tilesPath.replace(/^\//, ''))
const TILE_SIZE = 256

async function generateTiles() {
  const metadata = await sharp(SOURCE).metadata()
  const imgW = metadata.width
  const imgH = metadata.height

  // Pad 为正方形，边长 = max(imgW, imgH)
  const paddedDim = Math.max(imgW, imgH)

  // 计算最大缩放级别：使 maxZoom 级每片瓦片约 256px
  const maxZoom = config.maxZoom ?? Math.ceil(Math.log2(paddedDim / TILE_SIZE))

  console.log(`📷 源图片: ${imgW} × ${imgH}`)
  console.log(`📐 填充为: ${paddedDim} × ${paddedDim}`)
  console.log(`🔍 最大缩放: z=${maxZoom}（每片约 ${Math.round(paddedDim / Math.pow(2, maxZoom))}×${Math.round(paddedDim / Math.pow(2, maxZoom))}px）`)
  console.log(`📁 输出目录: ${OUTPUT}`)
  console.log('---')

  // 清理旧瓦片
  if (existsSync(OUTPUT)) {
    rmSync(OUTPUT, { recursive: true })
    console.log('🗑️  已清理旧瓦片目录')
  }

  // 将图片 pad 为正方形（图片在左上角，右下角填充透明）
  const paddedBuffer = await sharp(SOURCE)
    .resize(paddedDim, paddedDim, { fit: 'contain', position: 'left top', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  let totalTiles = 0

  for (let z = 0; z <= maxZoom; z++) {
    // 标准瓦片金字塔：z 级网格 = 2^z × 2^z
    const tilesPerSide = Math.pow(2, z)
    const tileSizeInPadded = paddedDim / tilesPerSide // 每片瓦片在 pad 正方形中的像素尺寸

    let levelTiles = 0

    for (let ty = 0; ty < tilesPerSide; ty++) {
      for (let tx = 0; tx < tilesPerSide; tx++) {
        // CRS.Simple 的 y-flip 约定：ty=0 → 图像底部，ty=max → 图像顶部
        // 文件 ty 对应 pad 正方形中的行（从底部开始）
        const fileRow = (tilesPerSide - 1 - ty) // 翻转 y：文件行从顶部开始

        // 瓦片在 pad 正方形中的像素区域（从顶部计算）
        const left = Math.round(tx * tileSizeInPadded)
        const top = Math.round(fileRow * tileSizeInPadded)
        const width = Math.round((tx + 1) * tileSizeInPadded) - left
        const height = Math.round((fileRow + 1) * tileSizeInPadded) - top

        // 创建目录和瓦片路径
        const tileDir = join(OUTPUT, String(z), String(tx))
        if (!existsSync(tileDir)) {
          mkdirSync(tileDir, { recursive: true })
        }
        const tilePath = join(tileDir, `${ty}.png`)

        // 检查瓦片是否与原图有交集
        // 原图占据 pad 正方形的左上角: [0,0] ~ [imgW, imgH]
        const overlapLeft = Math.max(left, 0)
        const overlapTop = Math.max(top, 0)
        const overlapRight = Math.min(left + width, imgW)
        const overlapBottom = Math.min(top + height, imgH)

        if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) {
          // 瓦片完全在图片区域外，生成透明瓦片（避免 Leaflet 显示灰色）
          await sharp({ create: { width: TILE_SIZE, height: TILE_SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
            .png()
            .toFile(tilePath)
          totalTiles++
          levelTiles++
          continue
        }

        await sharp(paddedBuffer)
          .extract({ left, top, width, height })
          .resize(TILE_SIZE, TILE_SIZE, { fit: 'fill' })
          .png()
          .toFile(tilePath)

        totalTiles++
        levelTiles++
      }
    }

    console.log(`z=${z}: ${tilesPerSide}×${tilesPerSide} 网格, 有效 ${levelTiles} 片`)
  }

  console.log('---')
  console.log(`✅ 完成！共生成 ${totalTiles} 个瓦片`)
  console.log(`📁 输出目录: ${OUTPUT}`)
  console.log(`💡 maxNativeZoom: ${maxZoom}`)
  console.log(`💡 paddedDim: ${paddedDim}（前端需使用此值设置 CRS bounds）`)
}

generateTiles().catch((err) => {
  console.error('❌ 生成失败:', err.message)
  process.exit(1)
})
