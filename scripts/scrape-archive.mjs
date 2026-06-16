import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const ASSETS_DIR = path.join(ROOT, 'src', 'assets', 'archive')
const DATA_FILE = path.join(ROOT, 'src', 'data', 'scrapedCollections.json')

const COLLECTIONS = [
  {
    slug: 'time-in-bloom',
    name: 'Time In Bloom',
    category: 'Haute Couture',
    year: 2026,
    season: 'Haute Couture 2026',
    url: 'https://azziandosta.com/haute-couture/time-in-bloom/',
  },
  {
    slug: 'untamed-harmonies',
    name: 'Untamed Harmonies',
    category: 'Haute Couture',
    year: 2024,
    season: 'Autumn/Winter 2024-2025 Haute Couture',
    url: 'https://azziandosta.com/haute-couture/untamed-harmonies/',
  },
  {
    slug: 'the-sacred-spring',
    name: 'The Sacred Spring',
    category: 'Haute Couture',
    year: 2023,
    season: 'Autumn/Winter 2023-2024 Haute Couture',
    url: 'https://azziandosta.com/haute-couture/the-sacred-spring/',
  },
  {
    slug: 'philarmonie-astrale',
    name: 'Philharmonie Astrale',
    category: 'Haute Couture',
    year: 2023,
    season: 'Spring/Summer 2023 Haute Couture',
    url: 'https://azziandosta.com/haute-couture/philarmonie-astrale/',
  },
  {
    slug: 'entre-mer-et-lumiere',
    name: 'Entre Mer et Lumière',
    category: 'Haute Couture',
    year: 2023,
    season: 'Haute Couture',
    url: 'https://azziandosta.com/haute-couture/entre-mer-et-lumiere/',
  },
  {
    slug: 'oeuvres-rebelles',
    name: 'Œuvres Rebelles',
    category: 'Haute Couture',
    year: 2022,
    season: 'Haute Couture',
    url: 'https://azziandosta.com/haute-couture/oeuvres-rebelles/',
  },
  {
    slug: 'la-matiere-du-vent',
    name: 'La Matière du Vent',
    category: 'Haute Couture',
    year: 2022,
    season: 'Haute Couture',
    url: 'https://azziandosta.com/haute-couture/la-matiere-du-vent/',
  },
  {
    slug: 'reve-flamand',
    name: 'Rêve Flamand',
    category: 'Haute Couture',
    year: 2021,
    season: 'Haute Couture',
    url: 'https://azziandosta.com/haute-couture/reve-flamand/',
  },
  {
    slug: 'the-au-trianon',
    name: 'Thé au Trianon',
    category: 'Haute Couture',
    year: 2021,
    season: 'Haute Couture',
    url: 'https://azziandosta.com/haute-couture/the-au-trianon/',
  },
  {
    slug: 'through-the-lens',
    name: 'Through the Lens',
    category: 'Haute Couture',
    year: 2019,
    season: 'Autumn/Winter 2019-2020 Haute Couture',
    url: 'https://azziandosta.com/haute-couture/through-the-lens/',
  },
  {
    slug: 'twelve',
    name: 'Twelve',
    category: 'Ready-to-Wear',
    year: 2024,
    season: 'Autumn/Winter 2024 Ready-to-Wear',
    url: 'https://azziandosta.com/twelve/',
  },
  {
    slug: 'act-11',
    name: 'Act 11',
    category: 'Ready-to-Wear',
    year: 2023,
    season: 'Ready-to-Wear',
    url: 'https://azziandosta.com/act-11/',
  },
  {
    slug: 'sequence-10',
    name: 'Sequence 10',
    category: 'Ready-to-Wear',
    year: 2022,
    season: 'Ready-to-Wear',
    url: 'https://azziandosta.com/sequence-10/',
  },
  {
    slug: 'volume-9',
    name: 'Volume 9',
    category: 'Ready-to-Wear',
    year: 2021,
    season: 'Ready-to-Wear',
    url: 'https://azziandosta.com/volume-9/',
  },
  {
    slug: 'drop-15',
    name: 'Drop 15',
    category: 'Ready-to-Wear',
    year: 2025,
    season: 'Drop 15',
    url: 'https://azziandosta.com/drop-15/',
  },
  {
    slug: 'new-beginnings',
    name: 'New Beginnings',
    category: 'Bridal',
    year: 2024,
    season: 'New Beginnings Bridal',
    url: 'https://azziandosta.com/new-beginnings/',
  },
  {
    slug: 'finding-forever',
    name: 'Finding Forever',
    category: 'Bridal',
    year: 2024,
    season: 'Finding Forever Bridal',
    url: 'https://azziandosta.com/finding-forever/',
  },
]

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function categoryCode(category) {
  if (category === 'Haute Couture') return 'HC'
  if (category === 'Ready-to-Wear') return 'RTW'
  return 'BR'
}

function cleanName(raw) {
  return raw
    .replace(/\*+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseRtwImages(markdown, collection) {
  const looks = []
  const groups = new Map()

  for (const line of markdown.split('\n')) {
    const imageMatch = line.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/)
    if (!imageMatch) continue
    const url = imageMatch[1]
    if (url.includes('header') || url.endsWith('.pdf')) continue

    const lookMatch = url.match(/LOOK([\d]+(?:-[\d]+)?)/i)
    const key = lookMatch ? lookMatch[1] : url
    if (!groups.has(key)) groups.set(key, { imageUrl: url, key })
  }

  let index = 0
  for (const group of groups.values()) {
    index += 1
    const label = group.key.includes('-')
      ? `Look ${group.key.replace('-', '–')}`
      : `Look ${group.key}`
    looks.push({
      name: label,
      description: `${label} from the ${collection.name} collection by AZZI & OSTA.`,
      imageUrl: group.imageUrl,
      imageHd: group.imageUrl,
    })
  }

  return looks
}

function parseJinaMarkdown(markdown, collection) {
  const looks = []
  const lines = markdown.split('\n')
  let pendingImages = []
  let pendingDescription = ''

  const flushLook = (name) => {
    const clean = cleanName(name)
    if (!clean || clean.length < 2) return
    if (/^lorem ipsum/i.test(clean)) return
    if (clean.toLowerCase() === collection.name.toLowerCase()) return
    const imageUrl = pendingImages.find((url) => !url.includes('logo')) ?? pendingImages[0]
    if (!imageUrl) return
    looks.push({
      name: clean,
      description: pendingDescription,
      imageUrl,
      imageHd: imageUrl.replace(/-\d+x\d+(?=\.\w+$)/, ''),
    })
    pendingImages = []
    pendingDescription = ''
  }

  for (const line of lines) {
    const imageMatch = line.match(/!\[[^\]]*\]\((https?:\/\/[^)]+)\)/)
    if (imageMatch) {
      pendingImages.push(imageMatch[1])
      continue
    }

    const italicName = line.match(/^_{1,2}([^_]+)_{1,2}\s*$/)
    if (italicName) {
      flushLook(italicName[1])
      continue
    }

    const boldName = line.match(/^\*\*([^*]+)\*\*\s*$/)
    if (boldName && boldName[1].length < 60 && !boldName[1].includes('AZZI')) {
      flushLook(boldName[1])
      continue
    }

    if (line.trim() && !line.startsWith('#') && !line.startsWith('![') && pendingImages.length) {
      const text = line.trim()
      if (text.length > 40 && !/^lorem ipsum/i.test(text)) {
        pendingDescription = text
      }
    }
  }

  if (looks.length === 0) return parseRtwImages(markdown, collection)
  return looks
}

async function fetchViaJina(url) {
  const proxyUrl = `https://r.jina.ai/${url}`
  const response = await fetch(proxyUrl, {
    headers: { Accept: 'text/plain' },
    signal: AbortSignal.timeout(120_000),
  })
  if (!response.ok) throw new Error(`${url} -> ${response.status}`)
  return response.text()
}

async function downloadImage(url, dest) {
  if (existsSync(dest)) return true
  const response = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(60_000),
  })
  if (!response.ok) return false
  const buffer = Buffer.from(await response.arrayBuffer())
  if (buffer.length < 3000) return false
  await writeFile(dest, buffer)
  return true
}

async function main() {
  await mkdir(ASSETS_DIR, { recursive: true })

  const existing = existsSync(DATA_FILE)
    ? JSON.parse(await readFile(DATA_FILE, 'utf8'))
    : []

  const existingCountBySlug = new Map()
  for (const item of existing) {
    existingCountBySlug.set(
      item.collectionSlug,
      (existingCountBySlug.get(item.collectionSlug) ?? 0) + 1,
    )
  }

  const collectionsToFetch = process.argv.includes('--all')
    ? COLLECTIONS
    : COLLECTIONS.filter((collection) => (existingCountBySlug.get(collection.slug) ?? 0) === 0)

  const allItems = process.argv.includes('--all') ? [] : [...existing]
  let id = allItems.length + 1
  const newItems = []

  for (const collection of collectionsToFetch) {
    console.log(`Fetching ${collection.name}...`)
    let markdown
    try {
      markdown = await fetchViaJina(collection.url)
    } catch (error) {
      console.warn(`  Skipped: ${error.message}`)
      continue
    }

    const looks = parseJinaMarkdown(markdown, collection)
    console.log(`  Parsed ${looks.length} looks with images`)

    looks.forEach((look, index) => {
      const lookSlug = slugify(look.name)
      const ext = path.extname(new URL(look.imageUrl).pathname) || '.jpg'
      const filename = `${collection.slug}-${lookSlug}${ext}`
      const code = `AO-${collection.year}-${categoryCode(collection.category)}-${String(index + 1).padStart(2, '0')}`

      const item = {
        id: String(id++),
        collectionSlug: collection.slug,
        collectionName: collection.name,
        code,
        name: look.name,
        year: collection.year,
        category: collection.category,
        collectionSeason: collection.season,
        detailTag: collection.name,
        description:
          look.description ||
          `${look.name} from the ${collection.name} collection by AZZI & OSTA.`,
        fabrics: 'See atelier records',
        constructionTime: 'Atelier craftsmanship',
        patternReference: `Collection / ${collection.name}`,
        imageUrl: look.imageUrl,
        imageHdUrl: look.imageHd,
        filename,
        localImage: `archive/${filename}`,
      }

      allItems.push(item)
      newItems.push(item)
    })

    await new Promise((r) => setTimeout(r, 500))
  }

  console.log(`Downloading ${newItems.length} new images...`)
  let saved = 0
  for (const item of newItems) {
    const dest = path.join(ASSETS_DIR, item.filename)
    const ok = await downloadImage(item.imageUrl, dest)
    if (!ok) {
      item.localImage = null
      console.warn(`  Failed: ${item.name}`)
    } else {
      saved++
      if (saved % 25 === 0) console.log(`  Saved ${saved} images...`)
    }
    await new Promise((r) => setTimeout(r, 80))
  }

  await writeFile(DATA_FILE, JSON.stringify(allItems, null, 2), 'utf8')
  console.log(`Done: ${allItems.length} items, ${saved} images saved`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
