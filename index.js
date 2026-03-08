import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const model = process.env.MODEL || 'gemini-2.5-flash';
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});
app.use(cors());
app.use(express.json());
// Static files from 'public' folder (serves index.html automatically)
app.use(express.static('public'));


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Hello Bro')
})

app.post('/api/chat', async (req, res) => {
    try {
        const { conversation } = req.body;

        if (!conversation || !Array.isArray(conversation)) {
            res.status(400).json({ error: 'Invalid conversation format' });
            return;
        }

        const contents = conversation.map(({ role, text }) => {
            return {
                role,
                parts: [{ text }]
            };
        });

        console.log(`Mengirim permintaan ke model: ${model}`);

        const response = await ai.models.generateContent({
            model: model,
            contents,
            systemInstruction: 'anda adalah seorang guru yang baik hati dan membantu siswa dengan sabar. Jawab dengan bahasa Indonesia yang santai dan mudah dimengerti. Berikan penjelasan yang detail dan contoh jika diperlukan.',
            config: {
                temperature: 0.9,
                systemInstructions: 'anda adalah seorang guru yang baik hati dan membantu siswa dengan sabar. Jawab dengan bahasa Indonesia yang santai dan mudah dimengerti. Berikan penjelasan yang detail dan contoh jika diperlukan.',
            },
        });
        res.status(200).json({ result: response.text });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});