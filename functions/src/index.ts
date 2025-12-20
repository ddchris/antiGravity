import * as functions from "firebase-functions";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

// Define the secret to be used
// Note: You must run `firebase functions:secrets:set GEMINI_API_KEY` before deploying
// export const chat = onRequest({ secrets: ["GEMINI_API_KEY"], cors: true }, async (req, res) => {
// However, for simpler setup without enforcing secrets immediately in code (which might fail if not set), 
// we can access process.env.GEMINI_API_KEY. Best practice is utilizing the secrets configuration.
// Let's use the robust standard way.

export const chat = onRequest(
  {
    secrets: ["GEMINI_API_KEY"],
    cors: true // Enable CORS for frontend access
  },
  async (req, res) => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
        return;
      }

      const userMessage = req.body.message;
      const systemInstruction = req.body.systemInstruction; // Optional: Pass system instructions if needed

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        logger.error("GEMINI_API_KEY is not set.");
        res.status(500).json({ error: 'Server misconfiguration: API Key missing' });
        return;
      }

      if (!userMessage) {
        res.status(400).json({ error: 'Message is required' });
        return;
      }

      // Dynamic Model Discovery
      let targetModel = 'gemini-1.5-flash'; // Optimistic default

      try {
        const { data: listData } = await axios.get(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        if (listData.models) {
          // Find the best available model (Prefer Flash -> 1.5 -> Pro)
          const validModel = listData.models.find((m: any) =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes('generateContent') &&
            (m.name.includes('flash') || m.name.includes('1.5'))
          ) || listData.models.find((m: any) => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));

          if (validModel) {
            targetModel = validModel.name.replace('models/', '');
            logger.info("Selected Gemini Model:", targetModel);
          }
        }
      } catch (discoveryError: any) {
        logger.warn("Model discovery failed, using default.", discoveryError.message);
      }

      // Construct URL
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

      const payload: any = {
        contents: [{ parts: [{ text: userMessage }] }]
      };

      if (systemInstruction) {
        payload.systemInstruction = systemInstruction;
      }

      const response = await axios.post(url, payload);

      res.json(response.data);

    } catch (err: any) {
      logger.error("Gemini API error", err.message);
      if (err.response) {
        logger.error("Gemini API details", err.response.data);
        res.status(err.response.status || 500).json(err.response.data);
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  }
);
