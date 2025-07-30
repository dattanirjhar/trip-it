// /api/generate.js

const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { destination, duration, interests } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!destination || !duration || !interests) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'The API key is not configured on the server. Please check Vercel environment variables.' });
    }

    // **FIXED**: Simplified the prompt to be less strict and more effective.
    const prompt = `
      You are an expert travel planner. Your task is to generate a detailed travel itinerary based on the user's input.

      **User Input:**
      - Destination: "${destination}"
      - Trip Duration: ${duration} days
      - Interests: "${interests}"

      **Instructions:**
      - Provide the response as a single, valid JSON object only, with no other text, explanations, or markdown formatting.
      - The JSON object must follow this exact structure:
          {"destination": "${destination}","duration": ${duration},"center": [latitude, longitude],"days": [{"day": 1,"theme": "A short, catchy theme for the day's activities","locations": [{"name": "Location Name","coords": [latitude, longitude],"time": "Suggested Time (e.g., 9:00 AM - 11:00 AM)","description": "A brief, one or two-sentence description of the place and why to visit."}]}]}
      
      - If the provided destination is not a real place, return a JSON object with this error structure: {"error": "Please provide a real destination."}
      - Ensure all fields are filled correctly for a valid itinerary. The 'center' field must be the geographical center of the destination, and 'coords' must be accurate latitude/longitude arrays.
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

    if (responseData.candidates && responseData.candidates.length > 0) {
      const rawText = responseData.candidates[0].content.parts[0].text;
      const jsonString = rawText.substring(rawText.indexOf('{'), rawText.lastIndexOf('}') + 1);
      const parsedResponse = JSON.parse(jsonString);

      // Check if the AI returned our specific error structure.
      if (parsedResponse.error) {
        console.log("AI flagged invalid input:", parsedResponse.error);
        return res.status(400).json({ error: parsedResponse.error });
      }

      return res.status(200).json(responseData); // Send the original, full responseData back
    } else {
      console.error("API response missing candidates:", responseData);
      return res.status(500).json({ error: "The AI did not return a valid response. This might be due to a safety filter." });
    }

  } catch (error) {
    console.error('Error in API function:', error);
    res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
};

