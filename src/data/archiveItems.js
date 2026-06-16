import scrapedRaw from './scrapedCollections.json'

const legacyImages = import.meta.glob('../assets/[1-8].jpg', {
  eager: true,
  import: 'default',
})

const archiveImages = import.meta.glob('../assets/archive/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})

const COLLECTION_TITLE_NAMES = new Set([
  'time in bloom',
  'untamed harmonies',
  'the sacred spring',
  'philharmonie astrale',
  'entre mer et lumière',
  'entre mer et lumiere',
  'œuvres rebelles',
  'oeuvres rebelles',
  'la matière du vent',
  'la matiere du vent',
  'rêve flamand',
  'reve flamand',
  'thé au trianon',
  'the au trianon',
  'through the lens',
  'twelve',
  'act 11',
  'sequence 10',
  'volume 9',
  'drop 15',
  'new beginnings',
  'finding forever',
])

function resolveArchiveImage(localImage, fallbackUrl) {
  if (localImage) {
    const assetPath = `../assets/${localImage}`
    if (archiveImages[assetPath]) return archiveImages[assetPath]
  }
  return fallbackUrl ?? null
}

function isCollectionTitle(name) {
  return COLLECTION_TITLE_NAMES.has(name.trim().toLowerCase())
}

function isInvalidAsset(item) {
  const source = `${item.imageUrl ?? ''} ${item.localImage ?? ''}`.toLowerCase()
  return /arrow-right|g\.gif|woocommerce|pixel\.wp\.com|currency-switcher/.test(source)
}

const scrapedItems = scrapedRaw
  .filter((item) => item.localImage && !isCollectionTitle(item.name) && !isInvalidAsset(item))
  .map((item) => ({
    id: item.id,
    code: item.code,
    name: item.name,
    year: item.year,
    category: item.category,
    detailTag: item.detailTag,
    description: item.description,
    collectionSeason: item.collectionSeason,
    fabrics: item.fabrics,
    constructionTime: item.constructionTime,
    patternReference: item.patternReference,
    collectionName: item.collectionName,
    image: resolveArchiveImage(item.localImage, item.imageUrl),
    imageHd: resolveArchiveImage(item.localImage, item.imageHdUrl ?? item.imageUrl),
  }))
  .filter((item) => item.image)

const legacyItems = [
  {
    id: 'legacy-1',
    code: 'AO-24-HC-01',
    name: 'Botanical Petal Lace Column',
    year: 2024,
    category: 'Haute Couture',
    detailTag: 'Hand-embroidered tonal bugle beads',
    description:
      'Asymmetrical architectural silhouette with sculptural structural boning beneath hand-corded Chantilly lace.',
    collectionSeason: 'Spring/Summer 2024 Haute Couture',
    fabrics:
      'Hand-Corded Chantilly Lace, Laser-Cut Silk Organza Petals, Nude Double-Faced Crepe',
    constructionTime: '210 Hours of Hand Atelier Craftsmanship',
    patternReference: 'Drawer A / Folder 08',
    collectionName: 'Archive Selection',
    image: legacyImages['../assets/1.jpg'],
    imageHd: legacyImages['../assets/1.jpg'],
  },
  {
    id: 'legacy-2',
    code: 'AO-23-HC-05',
    name: 'Gilded Geometric Column',
    year: 2023,
    category: 'Haute Couture',
    detailTag: 'Silk Gazar draping',
    description:
      'Structured column with vermilion silk tulle wrap and hand-applied micro-sequin tessellation.',
    collectionSeason: 'Autumn/Winter 2023 Haute Couture',
    fabrics:
      'Metallic Gold Silk Gazar, Hand-Applied Micro-Sequins, Double-Faced Crepe Foundation',
    constructionTime: '280 Hours of Hand Atelier Craftsmanship',
    patternReference: 'Drawer A / Folder 05',
    collectionName: 'Archive Selection',
    image: legacyImages['../assets/2.jpg'],
    imageHd: legacyImages['../assets/2.jpg'],
  },
  {
    id: 'legacy-3',
    code: 'AO-24-HC-08',
    name: 'Medallion Sash Gown',
    year: 2024,
    category: 'Haute Couture',
    detailTag: 'Asymmetrical architectural silhouette',
    description:
      'Balloon-sleeve bodice with jeweled talisman appliqué over a sculpted silk crepe column skirt.',
    collectionSeason: 'Spring/Summer 2024 Haute Couture',
    fabrics: 'Silk Zibeline, Heavy Double-Faced Crepe, Hand-Cast Gold-Plated Brass Medallions',
    constructionTime: '280 Hours of Hand Atelier Craftsmanship',
    patternReference: 'Drawer C / Folder 05',
    collectionName: 'Archive Selection',
    image: legacyImages['../assets/3.jpg'],
    imageHd: legacyImages['../assets/3.jpg'],
  },
  {
    id: 'legacy-4',
    code: 'AO-24-HC-12',
    name: 'Orchid Reverie Architectural Cape',
    year: 2024,
    category: 'Haute Couture',
    detailTag: 'Sculptural structural boning',
    description:
      'Hand-cut silk petal appliqué on a structured mini silhouette with voluminous silk gazar cape.',
    collectionSeason: 'Spring/Summer 2024 Haute Couture',
    fabrics: 'Silk Gazar, Structured Organza, Hand-Cut Silk Petals',
    constructionTime: '280 Hours of Hand Atelier Craftsmanship',
    patternReference: 'Drawer A / Folder 01',
    collectionName: 'Archive Selection',
    image: legacyImages['../assets/4.jpg'],
    imageHd: legacyImages['../assets/4.jpg'],
  },
  {
    id: 'legacy-5',
    code: 'AO-23-HC-08',
    name: 'Azure Wing Gown',
    year: 2023,
    category: 'Haute Couture',
    detailTag: 'Silk Gazar draping',
    description:
      'Architectural wing-lapel bolero with 3D petal embroidery over a voluminous silk gazar A-line.',
    collectionSeason: 'Spring/Summer 2023 Haute Couture',
    fabrics: 'Silk Gazar, Structured Silk Satin, Laser-Cut Organza Petals',
    constructionTime: '210 Hours of Hand Atelier Craftsmanship',
    patternReference: 'Drawer B / Folder 03',
    collectionName: 'Archive Selection',
    image: legacyImages['../assets/5.jpg'],
    imageHd: legacyImages['../assets/5.jpg'],
  },
  {
    id: 'legacy-6',
    code: 'AO-24-HC-02',
    name: 'Citron Cloud Gown',
    year: 2024,
    category: 'Haute Couture',
    detailTag: 'Hand-embroidered tonal bugle beads',
    description:
      'Tiered silk tulle ruffles with off-shoulder boning and a cinched double-faced crepe bodice.',
    collectionSeason: 'Spring/Summer 2024 Haute Couture',
    fabrics: 'Multi-Layered Silk Tulle, Structured Double-Faced Crepe, Silk Organza',
    constructionTime: '210 Hours of Hand Atelier Craftsmanship',
    patternReference: 'Drawer C / Folder 01',
    collectionName: 'Archive Selection',
    image: legacyImages['../assets/6.jpg'],
    imageHd: legacyImages['../assets/6.jpg'],
  },
  {
    id: 'legacy-7',
    code: 'AO-25-RTW-12',
    name: 'Blush Sculpted Suit',
    year: 2025,
    category: 'Ready-to-Wear',
    detailTag: 'Double-faced crepe',
    description:
      'Double-breasted tailored suit with exaggerated shawl collar and cathedral-length silk tulle train.',
    collectionSeason: 'Spring/Summer 2025 Ready-to-Wear',
    fabrics: 'Structured Double-Faced Crepe, Italian Silk Tulle',
    constructionTime: '110 Hours of Hand Atelier Craftsmanship',
    patternReference: 'Drawer A / Folder 14',
    collectionName: 'Archive Selection',
    image: legacyImages['../assets/7.jpg'],
    imageHd: legacyImages['../assets/7.jpg'],
  },
  {
    id: 'legacy-8',
    code: 'AO-23-HC-12',
    name: 'Crimson Moiré Gown',
    year: 2023,
    category: 'Haute Couture',
    detailTag: 'Asymmetrical architectural silhouette',
    description:
      'Strapless mermaid with sculptural ruffle bodice in structured moiré silk and internal corsetry.',
    collectionSeason: 'Autumn/Winter 2023 Haute Couture',
    fabrics: 'Structured Moiré Silk, Silk Gazar Lining, Double-Faced Crepe Interfacing',
    constructionTime: '180 Hours of Hand Atelier Craftsmanship',
    patternReference: 'Drawer A / Folder 01',
    collectionName: 'Archive Selection',
    image: legacyImages['../assets/8.jpg'],
    imageHd: legacyImages['../assets/8.jpg'],
  },
]

export const CATEGORIES = ['Haute Couture', 'Ready-to-Wear', 'Bridal']

export const YEARS = Array.from({ length: 17 }, (_, i) => 2010 + i)

export const MOBILE_YEAR_PILLS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019]

export const archiveItems = [...legacyItems, ...scrapedItems]

export const aiLookMatch = {
  confidence: 98,
  seasonLabel: 'Autumn/Winter 2023 Couture',
  lookLabel: 'Look 12',
  item: archiveItems.find((item) => item.code === 'AO-23-HC-12'),
}

export const aiPartialMatches = {
  confidence: 74,
  items: [
    archiveItems.find((item) => item.code === 'AO-23-HC-12'),
    archiveItems.find((item) => item.code === 'AO-23-HC-05'),
    archiveItems.find((item) => item.code === 'AO-23-HC-08'),
  ].filter(Boolean),
}
