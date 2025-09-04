const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

// Voice configurations for Chinese-accented English
const voiceConfigs = {
    'XiaoLing': {
        rate: '0.85',
        pitch: '+20Hz',
        volume: '0.9',
        accent: 'chinese'
    },
    'MeiLing': {
        rate: '0.90',
        pitch: '+15Hz',
        volume: '0.8',
        accent: 'chinese'
    },
    'AiShan': {
        rate: '0.80',
        pitch: '+25Hz',
        volume: '0.85',
        accent: 'chinese'
    }
};

// Create temp directory for audio files
const tempDir = path.join(__dirname, 'temp-audio');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

app.post('/speak', async (req, res) => {
    try {
        const { text, voice = 'XiaoLing' } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const config = voiceConfigs[voice] || voiceConfigs['XiaoLing'];
        const timestamp = Date.now();
        const filename = `speech_${timestamp}.wav`;
        const filepath = path.join(tempDir, filename);

        // Use macOS 'say' command with Chinese-influenced settings
        let sayCommand;
        
        if (process.platform === 'darwin') {
            // Try to find Chinese-English voices first
            const chineseVoices = ['Ting-Ting', 'Sin-ji', 'Mei-Jia'];
            sayCommand = `say -v "${chineseVoices[0]}" -r ${parseFloat(config.rate) * 200} -o "${filepath}" "${text.replace(/"/g, '\\"')}"`;
        } else {
            // Fallback for other platforms
            sayCommand = `echo "${text.replace(/"/g, '\\"')}" | espeak -s ${Math.round(parseFloat(config.rate) * 200)} -p ${config.pitch.replace(/[^0-9]/g, '')} -a ${Math.round(parseFloat(config.volume) * 100)} -w "${filepath}"`;
        }

        exec(sayCommand, (error, stdout, stderr) => {
            if (error) {
                console.error('TTS Error:', error);
                return res.status(500).json({ error: 'TTS generation failed' });
            }

            // Check if file was created
            if (!fs.existsSync(filepath)) {
                return res.status(500).json({ error: 'Audio file not generated' });
            }

            // Send the audio file
            res.setHeader('Content-Type', 'audio/wav');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            const audioStream = fs.createReadStream(filepath);
            audioStream.pipe(res);

            // Clean up file after sending
            audioStream.on('end', () => {
                setTimeout(() => {
                    try {
                        fs.unlinkSync(filepath);
                    } catch (cleanupError) {
                        console.warn('Failed to cleanup temp file:', cleanupError);
                    }
                }, 1000);
            });
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'TTS Server running', voices: Object.keys(voiceConfigs) });
});

// List available voices
app.get('/voices', (req, res) => {
    if (process.platform === 'darwin') {
        exec('say -v ?', (error, stdout, stderr) => {
            if (error) {
                return res.json({ voices: Object.keys(voiceConfigs) });
            }
            const systemVoices = stdout.split('\n')
                .filter(line => line.includes('zh_') || line.includes('Chinese'))
                .map(line => line.split(/\s+/)[0]);
            
            res.json({ 
                configured: Object.keys(voiceConfigs),
                system: systemVoices
            });
        });
    } else {
        res.json({ voices: Object.keys(voiceConfigs) });
    }
});

app.listen(PORT, () => {
    console.log(`🎙️  TTS Server running on http://localhost:${PORT}`);
    console.log(`🗣️  Available voices: ${Object.keys(voiceConfigs).join(', ')}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down TTS server...');
    // Clean up temp directory
    try {
        fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (error) {
        console.warn('Failed to cleanup temp directory:', error);
    }
    process.exit(0);
});