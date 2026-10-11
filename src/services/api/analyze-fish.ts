export default async function handler(_req: unknown, res: { status: (code: number) => { json: (payload: unknown) => unknown } }) {
  return res.status(410).json({
    error: 'This project no longer uses the OpenAI-based analysis route. The app now performs local fish identification in the browser.',
  });
}