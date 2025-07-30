// /api/generate.js

// **DEFINITIVE FIX**: This file uses a globally available `fetch` (no `require` needed)
// and a simplified, more reliable prompt for the AI.

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { destination, duration, interests } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Securely read from Vercel Environment Variables

    if (!destination || !duration || !interests) {
      return res.status(400).json({ error: 'Missing required fields from frontend.' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'The API key is not configured on the server. Please check Vercel environment variables.' });
    }

    // **FIXED**: A simpler, more direct prompt that is more reliable.
    const prompt = `
      You are an expert travel planner. Generate a detailed travel itinerary for a trip to "${destination}" for ${duration} days, with a focus on "${interests}".
      
      Provide the response as a single, valid JSON object only, with no other text, explanations, or markdown formatting.
      
      The JSON object must follow this exact structure:
      {"destination": "${destination}","duration": ${duration},"center": [latitude, longitude],"days": [{"day": 1,"theme": "A short, catchy theme for the day's activities","locations": [{"name": "Location Name","coords": [latitude, longitude],"time": "Suggested Time (e.g., 9:00 AM - 11:00 AM)","description": "A brief, one or two-sentence description of the place and why to visit."}]}]}
      
      Ensure all fields are filled correctly. The 'center' field must be the geographical center of the destination, and 'coords' must be accurate latitude/longitude arrays.
    `;

    const modelName = "gemini-1.5-flash-latest";
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

    const geminiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const responseData = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("API Error Response:", responseData);
      const errorDetails = responseData.error?.message || `API request failed with status ${geminiResponse.status}`;
      return res.status(500).json({ error: `API Error: ${errorDetails}` });
    }
    
    // Send the successful response back to the frontend
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error in API function:', error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}

