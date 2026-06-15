import image1 from '../assets/1.jpg'
import image2 from '../assets/2.jpg'
import image3 from '../assets/3.jpg'
import image4 from '../assets/4.jpg'
import image5 from '../assets/5.jpg'
import image6 from '../assets/6.jpg'
import image7 from '../assets/7.jpg'
import image8 from '../assets/8.jpg'

export const CATEGORIES = ['Haute Couture', 'Ready-to-Wear', 'Bridal']

export const YEARS = Array.from({ length: 17 }, (_, i) => 2010 + i)

export const MOBILE_YEAR_PILLS = [2026, 2025, 2024, 2023, 2022, 2021, 2020]

export const archiveItems = [
  {
    id: '1',
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
    image: image1,
    imageHd: image1,
  },
  {
    id: '2',
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
    image: image2,
    imageHd: image2,
  },
  {
    id: '3',
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
    image: image3,
    imageHd: image3,
  },
  {
    id: '4',
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
    image: image4,
    imageHd: image4,
  },
  {
    id: '5',
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
    image: image5,
    imageHd: image5,
  },
  {
    id: '6',
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
    image: image6,
    imageHd: image6,
  },
  {
    id: '7',
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
    image: image7,
    imageHd: image7,
  },
  {
    id: '8',
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
    image: image8,
    imageHd: image8,
  },
]

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
  ],
}
