# Fish Lens

Fish Lens can use either its local visual heuristic or an experimental Hugging Face fish classifier. The classifier is opt-in and runs through a Netlify Function so its token is never exposed to the browser.

The fish catalog is intentionally limited to these 10 fish: Skipjack Tuna, Yellowfin Tuna, Bigeye Tuna, Round Scad, Eastern Little Tuna (Kawakawa), Narrow-Barred Spanish Mackerel, Blue Marlin, Emperor Fish, Grouper, and Northern Red Snapper. Other species are not included in the explorer or local identification catalog.

## Enable the hosted model

1. Deploy `paulprt/swin-fish-classification` as a Hugging Face Inference Endpoint. Its model card describes it as a baseline, notes class imbalance, and warns that it is not suitable out of the box. The endpoint must accept raw JPEG/PNG/WEBP request bodies and return JSON predictions shaped like `[{"label":"Chanos chanos","score":0.91}]` with scores from 0 to 1.
2. In Netlify, configure the server-side environment variables `HF_INFERENCE_URL` (the deployed endpoint URL) and `HF_TOKEN` (a private Hugging Face token).
3. Set `VITE_FISH_MODEL_API_ENABLED=true` at build time. The repository's `.env.example` shows this client-side feature flag; never put `HF_TOKEN` in a `VITE_` variable.
4. Deploy the site and Netlify Function. If the hosted model fails or returns a species not in the app's database, the scan reports an error instead of silently substituting the local heuristic.

When enabled, scan photos are sent to the configured inference endpoint. The displayed model score is not a verified probability of correct identification. The model covers 1,758 classes, while this app only presents the 10 fish in its catalog; predictions outside that list are not displayed as matches.

## Evaluate on labeled test images

Use a held-out labeled test split from Fish-Vista, or another test set representative of the photos this app will receive. Do not evaluate on training images. Create a JSON Lines manifest with one object per image, for example:

```json
{"imagePath":"images/fish-001.jpg","label":"Chanos chanos"}
{"imagePath":"images/fish-002.jpg","label":"Thunnus albacares"}
```

Run the top-1 evaluation against the deployed function:

```sh
node scripts/evaluate-fish-model.mjs https://YOUR_SITE/.netlify/functions/analyze-fish path/to/test-manifest.jsonl
```

The script reports top-1 accuracy for exactly the supplied manifest. Keep the evaluation split independent from model training and report its image count and class distribution alongside the result. A 90% target is only supported if a representative held-out evaluation reaches it.

## Local development

Without `VITE_FISH_MODEL_API_ENABLED=true`, analysis continues to use the existing local heuristic. To exercise the hosted path during development, run the app through Netlify Dev so `/.netlify/functions/analyze-fish` is available and configure the same server-side environment variables.
