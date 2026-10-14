type FunctionEvent = {
  httpMethod: string;
  body: string | null;
  isBase64Encoded?: boolean;
};

type FunctionResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

type Prediction = {
  label: string;
  score: number;
};

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function jsonResponse(statusCode: number, body: Record<string, unknown>): FunctionResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  };
}

function readPredictions(value: unknown): Prediction[] | null {
  const predictions = Array.isArray(value)
    ? value
    : typeof value === 'object' && value !== null && 'predictions' in value
    ? value.predictions
    : null;

  if (!Array.isArray(predictions)) {
    return null;
  }

  const parsed = predictions.flatMap((entry) => {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      !('label' in entry) ||
      typeof entry.label !== 'string' ||
      !('score' in entry) ||
      typeof entry.score !== 'number' ||
      !Number.isFinite(entry.score) ||
      entry.score < 0 ||
      entry.score > 1
    ) {
      return [];
    }
    return [{ label: entry.label, score: entry.score }];
  });

  return parsed.length > 0 && parsed.length === predictions.length
    ? parsed.sort((a, b) => b.score - a.score).slice(0, 20)
    : null;
}

export async function handler(event: FunctionEvent): Promise<FunctionResponse> {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Use POST to analyze a fish image.' });
  }

  const runtime = globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  };
  const environment = runtime.process?.env;
  const endpoint = environment?.HF_INFERENCE_URL;
  const token = environment?.HF_TOKEN;

  if (!endpoint || !token) {
    return jsonResponse(503, {
      error: 'The fish model is not configured. Set HF_INFERENCE_URL and HF_TOKEN in Netlify environment variables.',
    });
  }

  let endpointUrl: URL;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    return jsonResponse(500, { error: 'HF_INFERENCE_URL must be a valid HTTPS URL.' });
  }
  if (endpointUrl.protocol !== 'https:') {
    return jsonResponse(500, { error: 'HF_INFERENCE_URL must use HTTPS.' });
  }

  if (!event.body || event.isBase64Encoded) {
    return jsonResponse(400, { error: 'A JSON request containing an imageData value is required.' });
  }

  let imageData: unknown;
  try {
    const request = JSON.parse(event.body) as { imageData?: unknown };
    imageData = request.imageData;
  } catch {
    return jsonResponse(400, { error: 'The request body must be valid JSON.' });
  }

  if (typeof imageData !== 'string') {
    return jsonResponse(400, { error: 'The request must include an imageData string.' });
  }

  const imageMatch = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(imageData);
  if (!imageMatch) {
    return jsonResponse(400, { error: 'Use a JPEG, PNG, or WEBP image.' });
  }

  const [, contentType, encodedImage] = imageMatch;
  if (encodedImage.length > Math.ceil(MAX_IMAGE_BYTES * 4 / 3)) {
    return jsonResponse(413, { error: 'The prepared image is too large for model analysis.' });
  }

  let imageBytes: Uint8Array;
  try {
    const decoded = atob(encodedImage);
    if (decoded.length > MAX_IMAGE_BYTES) {
      return jsonResponse(413, { error: 'The prepared image is too large for model analysis.' });
    }
    imageBytes = Uint8Array.from(decoded, (character) => character.charCodeAt(0));
  } catch {
    return jsonResponse(400, { error: 'The image data is not valid base64.' });
  }

  let modelResponse: Response;
  try {
    modelResponse = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': contentType,
      },
      body: imageBytes,
    });
  } catch (error) {
    console.error('Fish model endpoint request failed:', error);
    return jsonResponse(502, {
      error: 'Could not reach the configured fish model endpoint. Check its availability and configuration.',
    });
  }

  if (!modelResponse.ok) {
    console.error(`Fish model endpoint returned HTTP ${modelResponse.status}.`);
    return jsonResponse(502, {
      error: `The fish model endpoint rejected the request (HTTP ${modelResponse.status}).`,
    });
  }

  let modelOutput: unknown;
  try {
    modelOutput = await modelResponse.json();
  } catch {
    return jsonResponse(502, { error: 'The fish model endpoint returned invalid JSON.' });
  }

  const predictions = readPredictions(modelOutput);
  if (!predictions) {
    return jsonResponse(502, {
      error: 'The fish model endpoint must return a list of { label, score } predictions with scores from 0 to 1.',
    });
  }

  return jsonResponse(200, { predictions });
}
