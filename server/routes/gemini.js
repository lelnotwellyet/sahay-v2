const express = require('express');

const router = express.Router();

// POST /chat - Endpoint to send user message and get response
router.post('/chat', async (req, res) => {
    // req.ai is injected from the server.js middleware
    const ai = req.ai; 
    const { message, chatHistory } = req.body;

    if (!message) {
        return res.status(400).json({ success: false, message: "Message is required" });
    }
    
    // We keep the API unavailable check here just in case.
    if (!ai) {
        return res.status(503).json({ success: false, message: "AI service is currently unavailable." });
    }

    try {
        // Define the System Instruction outside the contents array
        const systemInstructionText = "You are a kind, empathetic, and professional mental wellness assistant named Sahay. Your goal is to provide non-judgmental, supportive, and informative responses. You are not a replacement for a licensed counselor. Keep responses concise (under 150 words) and focused on emotional support and basic coping strategies. Do not provide medical advice.";
        
        // The contents array only contains the conversation history
        const contents = [
            ...chatHistory, // Previous conversation turns (must be user/model)
            {
                role: 'user',
                parts: [{ text: message }], // New user message
            }
        ];

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                // CORRECT WAY to pass system persona instruction
                systemInstruction: systemInstructionText 
            }
        });

        const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;

        if (responseText) {
            res.json({
                success: true,
                response: responseText,
            });
        } else {
            res.status(500).json({ success: false, message: "AI generated an empty or blocked response." });
        }

    } catch (error) {
        console.error('Gemini API Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to communicate with the AI assistant.' });
    }
});

module.exports = router;
