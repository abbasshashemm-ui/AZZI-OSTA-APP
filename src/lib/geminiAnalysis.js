import { GoogleGenAI } from '@google/genai'
import { archiveItems } from '../data/archiveItems'

export const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''

const GEMINI_TIMEOUT_MS = 45_000
const MODEL_ID = 'gemini-2.5-flash'
const MIN_MATCH_CONFIDENCE = 85

const VALID_SKUS = archiveItems.map((item) => item.code)

function buildCatalogueBlock() {
  return archiveItems
    .map(
      (item, index) => `
ITEM ${index + 1}:
  SKU: ${item.code}
  Name: ${item.name}
  Year: ${item.year}
  Category: ${item.category}
  Silhouette/Details: ${item.detailTag}
  Description: ${item.description}
  Fabrics: ${item.fabrics}`,
    )
    .join('\n')
}

const ANALYSIS_PROMPT = `You are a strict archival garment identifier for luxury fashion house Azzi & Osta. Your job is EXACT IDENTIFICATION, not recommendation or similarity ranking.

Compare the uploaded garment image against ONLY these ${archiveItems.length} archived looks:
${buildCatalogueBlock()}

RULES (follow exactly):
1. Return matched=true ONLY if the uploaded image depicts the SAME physical garment as one catalogue entry — same silhouette, construction, fabric treatment, and distinctive design details.
2. "Similar style", "same category", "closest match", or "resembles" is NOT sufficient. If you are unsure, return matched=false.
3. Do NOT guess. Do NOT pick the best or closest item when no exact match exists.
4. Non-fashion images, garments not in this catalogue, unusable photos, or images where the garment is not clearly visible → matched=false.
5. confidence is your certainty that this is an EXACT match (0-100). If confidence would be below ${MIN_MATCH_CONFIDENCE}, return matched=false.
6. When matched=true, sku must be exactly one of: ${VALID_SKUS.join(', ')}. When matched=false, sku must be null.`

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    matched: {
      type: 'BOOLEAN',
      description:
        'True only when the uploaded image is an exact match to one catalogue garment.',
    },
    sku: {
      type: 'STRING',
      nullable: true,
      format: 'enum',
      enum: VALID_SKUS,
      description: 'The matched archival SKU when matched=true, otherwise null.',
    },
    confidence: {
      type: 'INTEGER',
      description: 'Exact-match certainty from 0 to 100.',
    },
    reasoning: {
      type: 'STRING',
      description: 'One sentence explaining the identification decision.',
    },
  },
  required: ['matched', 'sku', 'confidence', 'reasoning'],
}

export class GeminiAnalysisError extends Error {
  constructor(userMessage, code, cause) {
    super(userMessage)
    this.name = 'GeminiAnalysisError'
    this.userMessage = userMessage
    this.code = code
    this.cause = cause
  }
}

export function isNoMatchError(error) {
  return (
    error instanceof GeminiAnalysisError &&
    (error.code === 'NO_MATCH' || error.code === 'LOW_CONFIDENCE')
  )
}

function parseConfidence(value) {
  const numeric = parseInt(String(value ?? '').replace(/[^\d]/g, ''), 10)
  return Number.isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : 0
}

function getLookLabel(code) {
  const segment = code?.split('-').pop()
  return segment ? `Look ${segment}` : 'Archive Match'
}

function getReasoning(parsed) {
  return typeof parsed.reasoning === 'string' && parsed.reasoning.trim()
    ? parsed.reasoning.trim()
    : 'No exact match found in the archive catalogue for this image.'
}

function rejectNoMatch(parsed, code = 'NO_MATCH') {
  throw new GeminiAnalysisError(getReasoning(parsed), code)
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
      'We could not read this image clearly. Please scan again.',
      'MALFORMED_JSON',
      error,
    )
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new GeminiAnalysisError(
      'We could not process this image. Please try another photo.',
      'INVALID_PAYLOAD',
    )
  }

  const confidence = parseConfidence(parsed.confidence)
  const sku =
    typeof parsed.sku === 'string' && parsed.sku.trim() ? parsed.sku.trim() : null

  if (parsed.matched === false || sku === null) {
    rejectNoMatch(parsed)
  }

  if (parsed.matched !== true) {
    rejectNoMatch(parsed, 'INVALID_MATCH_FLAG')
  }

  if (confidence < MIN_MATCH_CONFIDENCE) {
    throw new GeminiAnalysisError(
      `No confident exact match (${confidence}% confidence). This garment may not be in the catalogue.`,
      'LOW_CONFIDENCE',
    )
  }

  const item = archiveItems.find((entry) => entry.code === sku)
  if (!item) {
    throw new GeminiAnalysisError(
      'This look could not be matched in the archive. Please scan again.',
      'UNKNOWN_SKU',
    )
  }

  return {
    item,
    confidence,
    reasoning: getReasoning(parsed),
    seasonLabel: item.collectionSeason,
    lookLabel: getLookLabel(item.code),
  }
}

function mapTransportError(error) {
  if (error instanceof GeminiAnalysisError) return error

  if (error?.name === 'AbortError') {
    return new GeminiAnalysisError(
      'The scan took too long. Try again with a clearer photo or a stronger connection.',
      'TIMEOUT',
      error,
    )
  }

  const status = error?.status ?? error?.statusCode ?? error?.response?.status

  if (status === 401 || status === 403) {
    return new GeminiAnalysisError(
      'We could not complete the scan right now. Please try again in a moment.',
      'AUTH',
      error,
    )
  }

  if (status === 429) {
    return new GeminiAnalysisError(
      'The scanner is busy. Please wait a moment and try again.',
      'RATE_LIMIT',
      error,
    )
  }

  if (status >= 500) {
    return new GeminiAnalysisError(
      'The scanner is temporarily unavailable. Please try again shortly.',
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
      'The scanner is not available right now. Please try again later.',
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
      'Connection was interrupted. Check your internet and try again.',
      'NETWORK',
      error,
    )
  }

  return new GeminiAnalysisError(
    'Something went wrong during the scan. Please try again.',
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
      'The look scanner is not set up yet. Please contact your administrator.',
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
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    })

    const rawText = response.text
    if (!rawText?.trim()) {
      throw new GeminiAnalysisError(
        'We could not identify this look. Please scan again.',
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
  return 'We could not complete the scan. Please try again.'
}
