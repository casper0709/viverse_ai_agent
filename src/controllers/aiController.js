import geminiService from '../services/GeminiService.js';
import logger from '../utils/logger.js';

export const chat = async (req, res) => {
    try {
        const { message, history, stream } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // If streaming is requested
        if (stream) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const responseStream = geminiService.generateResponseStream(message, history || []);

            for await (const chunk of responseStream) {
                res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            }

            res.write('data: [DONE]\n\n');
            return res.end();
        }

        const response = await geminiService.generateResponse(message, history || []);

        res.status(200).json({
            success: true,
            reply: response,
            response: response
        });
    } catch (error) {

        logger.error(`AI Controller Error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: 'An error occurred while processing your request'
        });
    }
};

export const healthCheck = (req, res) => {
    res.status(200).json({ status: 'AI Service is online' });
};
