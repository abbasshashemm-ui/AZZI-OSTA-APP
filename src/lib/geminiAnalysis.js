import { GoogleGenAI } from '@google/genai'
import { archiveItems } from '../data/archiveItems'

export const GEMINI_API_KEY =
  'AQ.Ab8RN6IGWx7ThI_Navgho7Oz0H42zlxQKS0g3osojrzXrNZCKg'

const GEMINI_TIMEOUT_MS = 45_000
const MODEL_ID = 'gemini-2.5-flash'

const COLLECTION_DICTIONARY_STRING = `
- ITEM 1:
  SKU: AO-24-HC-01
  Year: 2024
  Category: Haute Couture
  Description: Asymmetrical architectural silhouette with sculptural structural boning beneath hand-corded Chantilly lace.
  Image_File: 1.jpg

- ITEM 2:
  SKU: AO-23-HC-05
  Year: 2023
  Category: Haute Couture
  Description: Structured column with vermilion silk tulle wrap and hand-applied micro-sequin tessellation.
  Image_File: 2.jpg

- ITEM 3:
  SKU: AO-24-HC-08
  Year: 2024
  Category: Haute Couture
  Description: Balloon-sleeve bodice with jeweled talisman appliqué over a sculpted silk crepe column skirt.
  Image_File: 3.jpg

- ITEM 4:
  SKU: AO-24-HC-12
  Year: 2024
  Category: Haute Couture
  Description: Hand-cut silk petal appliqué on a structured mini silhouette with voluminous silk gazar cape.
  Image_File: 4.jpg

- ITEM 5:
  SKU: AO-23-HC-08
  Year: 2023
  Category: Haute Couture
  Description: Architectural wing-lapel bolero with 3D petal embroidery over a voluminous silk gazar A-line.
  Image_File: 5.jpg

- ITEM 6:
  SKU: AO-24-HC-02
  Year: 2024
  Category: Haute Couture
  Description: Tiered silk tulle ruffles with off-shoulder boning and a cinched double-faced crepe bodice.
  Image_File: 6.jpg

- ITEM 7:
  SKU: AO-25-RTW-12
  Year: 2025
  Category: Ready-to-Wear
  Description: Double-breasted tailored suit with exaggerated shawl collar and cathedral-length silk tulle train.
  Image_File: 7.jpg

- ITEM 8:
  SKU: AO-23-HC-12
  Year: 2023
  Category: Haute Couture
  Description: Strapless mermaid with sculptural ruffle bodice in structured moiré silk and internal corsetry.
  Image_File: 8.jpg
`

const ANALYSIS_PROMPT = `You are the internal computer vision archivist for luxury fashion house Azzi & Osta. Look closely at the uploaded image's silhouette, tailoring style, fabric textures, and embroidery patterns. Compare it against this exact archive dictionary: const COLLECTION_DICTIONARY_STRING = \`${COLLECTION_DICTIONARY_STRING}\`

Your response must strictly be valid JSON in this exact format, with no markdown backticks around it:
{
  "sku": "MATCHING_SKU",
  "confidence": "MATCHING_PERCENTAGE",
  "reasoning": "1-sentence observation about why this matches the silhouette or fabric texture"
}`

export class GeminiAnalysisError extends Error {
  constructor(userMessage, code, cause) {
    super(userMessage)
    this.name = 'GeminiAnalysisError'
    this.userMessage = userMessage
    this.code = code
    this.cause = cause
  }
}

function parseConfidence(value) {
  const numeric = parseInt(String(value ?? '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : 0
}

function getLookLabel(code) {
  const segment = code?.split('-').pop()
  return segment ? `Look ${segment}` : 'Archive Match'
}

function sanitizeJsonText(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
}

function parseGeminiPayload(rawText) {
  let parsed

  try {
    parsed = JSON.parse(sanitizeJsonText(rawText))
  } catch (error) {
    throw new GeminiAnalysisError(
      'The vision model returned a malformed response. Please scan the garment again.',
      'MALFORMED_JSON',
      error,
    )
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new GeminiAnalysisError(
      'The vision model response was empty or unreadable. Please try another image.',
      'INVALID_PAYLOAD',
    )
  }

  if (!parsed.sku || typeof parsed.sku !== 'string') {
    throw new GeminiAnalysisError(
      'The vision model did not return a matching archival SKU. Please try again.',
      'MISSING_SKU',
    )
  }

  const item = archiveItems.find((entry) => entry.code === parsed.sku)
  if (!item) {
    throw new GeminiAnalysisError(
      `The returned SKU "${parsed.sku}" is not in the archive dictionary. Please scan again.`,
      'UNKNOWN_SKU',
    )
  }

  return {
    item,
    confidence: parseConfidence(parsed.confidence),
    reasoning:
      typeof parsed.reasoning === 'string' && parsed.reasoning.trim()
        ? parsed.reasoning.trim()
        : 'Visual silhouette and fabric texture aligned with the matched archive record.',
    seasonLabel: item.collectionSeason,
    lookLabel: getLookLabel(item.code),
  }
}

function mapTransportError(error) {
  if (error instanceof GeminiAnalysisError) return error

  if (error?.name === 'AbortError') {
    return new GeminiAnalysisError(
      'Vision analysis timed out. Try again with a smaller image or a stronger connection.',
      'TIMEOUT',
      error,
    )
  }

  const status = error?.status ?? error?.statusCode ?? error?.response?.status

  if (status === 401 || status === 403) {
    return new GeminiAnalysisError(
      'Unable to authenticate with the vision service. Verify the Gemini API key is active.',
      'AUTH',
      error,
    )
  }

  if (status === 429) {
    return new GeminiAnalysisError(
      'The vision service is temporarily rate-limited. Wait a moment and try again.',
      'RATE_LIMIT',
      error,
    )
  }

  if (status >= 500) {
    return new GeminiAnalysisError(
      'The vision service is temporarily unavailable. Please retry in a few moments.',
      'SERVER',
      error,
    )
  }

  const message = String(error?.message ?? '').toLowerCase()

  if (
    message.includes('api key') ||
    message.includes('unauthorized') ||
    message.includes('permission denied')
  ) {
    return new GeminiAnalysisError(
      'The Gemini API key appears invalid or expired. Check your credentials and retry.',
      'AUTH',
      error,
    )
  }

  if (
    message.includes('network') ||
    message.includes('failed to fetch') ||
    message.includes('networkerror')
  ) {
    return new GeminiAnalysisError(
      'Network connection was interrupted. Check your internet and try again.',
      'NETWORK',
      error,
    )
  }

  return new GeminiAnalysisError(
    'An unexpected error occurred during vision analysis. Please try again.',
    'UNKNOWN',
    error,
  )
}

function readImageAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string') {
        reject(
          new GeminiAnalysisError(
            'The selected file could not be read as an image.',
            'FILE_READ',
          ),
        )
        return
      }

      const base64 = result.split(',')[1]
      if (!base64) {
        reject(
          new GeminiAnalysisError(
            'The image encoding step failed. Please choose a different file.',
            'FILE_ENCODE',
          ),
        )
        return
      }

      resolve({
        base64,
        mimeType: file.type || 'image/jpeg',
      })
    }

    reader.onerror = () => {
      reject(
        new GeminiAnalysisError(
          'The browser could not load this image file. Try another photo.',
          'FILE_READ',
        ),
      )
    }

    reader.readAsDataURL(file)
  })
}

async function requestGeminiAnalysis(base64, mimeType) {
  if (!GEMINI_API_KEY?.trim()) {
    throw new GeminiAnalysisError(
      'The Gemini API key is not configured for this environment.',
      'MISSING_KEY',
    )
  }

  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: [
        { text: ANALYSIS_PROMPT },
        { inlineData: { mimeType, data: base64 } },
      ],
      config: {
        abortSignal: controller.signal,
      },
    })

    const rawText = response.text
    if (!rawText?.trim()) {
      throw new GeminiAnalysisError(
        'The vision model returned no analysis text. Please scan again.',
        'EMPTY_RESPONSE',
      )
    }

    return parseGeminiPayload(rawText)
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function analyzeGarmentImage(file) {
  if (!file) {
    throw new GeminiAnalysisError(
      'No image was provided for analysis.',
      'MISSING_FILE',
    )
  }

  if (!file.type?.startsWith('image/')) {
    throw new GeminiAnalysisError(
      'Only image files can be analyzed. Upload a JPG or PNG look photo.',
      'INVALID_FILE_TYPE',
    )
  }

  try {
    const { base64, mimeType } = await readImageAsBase64(file)
    return await requestGeminiAnalysis(base64, mimeType)
  } catch (error) {
    throw mapTransportError(error)
  }
}

export function getGeminiErrorMessage(error) {
  if (error instanceof GeminiAnalysisError) return error.userMessage
  if (error instanceof Error && error.message) return error.message
  return 'Unable to complete AI analysis. Please try again.'
}
