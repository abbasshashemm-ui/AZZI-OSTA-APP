import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = path.resolve('src/assets/login-models')
const BLACK_THRESHOLD = 28

function isPngWithAlpha(buffer) {
  if (buffer.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') return false
  let offset = 8
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset)
    const type = buffer.slice(offset + 4, offset + 8).toString('ascii')
    if (type === 'IHDR') {
      return buffer[offset + 17] === 6
    }
    offset += 12 + length
  }
  return false
}

for (const file of fs.readdirSync(dir)) {
  const inputPath = path.join(dir, file)
  const buffer = fs.readFileSync(inputPath)

  if (isPngWithAlpha(buffer)) {
    console.log(`skip ${file} (already RGBA PNG)`)
    continue
  }

  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD) {
      data[i + 3] = 0
    }
  }

  const outputName = file.replace(/\.(jpe?g|png)$/i, '.png')
  const outputPath = path.join(dir, outputName)

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)

  if (outputPath !== inputPath) {
    fs.unlinkSync(inputPath)
  }

  console.log(`keyed ${file} -> ${outputName}`)
}
