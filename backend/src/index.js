const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes');

const Groq = require('groq-sdk');
const axios = require('axios');
const ytdl = require('ytdl-core');  // Changed to ytdl-core instead of youtube-dl-exec
const { YoutubeTranscript } = require('youtube-transcript');
require('dotenv').config();


dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Initialize Groq
// const groq = new Groq({
//   apiKey: process.env.GROQ_API_KEY
// });
// Initialize Groq with error handling
let groq;
try {
  groq = new Groq({
    apiKey: "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"
  });
} catch (error) {
  console.error('Error initializing Groq:', error);
  process.exit(1);
}


// Routes
app.use('/api/users', userRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



// Helper function to extract video ID from YouTube URL
const getVideoId = (url) => {
  try {
    return ytdl.getVideoID(url);
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

async function generateQuestionsWithGroq(transcript, videoTitle) {
  try {
    const prompt = `You are a JSON generator that creates unique multiple-choice questions (MCQs) to test knowledge based on a video transcript. 

    Generate exactly 5 unique multiple-choice questions that focus on the key topics, concepts, and details presented in the video. Each question should:
    - Be relevant to the main content of the transcript, testing understanding of specific points discussed.
    - Have 4 answer options, one of which is correct and labeled with a "correct": true field. The other options should be plausible but incorrect, labeled with a "correct": false field.
    - Avoid questions about superficial details (such as title, description) and instead focus on content-based comprehension and critical analysis.

    Example JSON format:
    [
      {
        "question": "What is the main function of photosynthesis in plants?",
        "options": [
          {"text": "To absorb water from the soil", "correct": false},
          {"text": "To produce oxygen through respiration", "correct": false},
          {"text": "To convert sunlight into energy stored in glucose", "correct": true},
          {"text": "To provide support to plant structures", "correct": false}
        ]
      }
    ]

    Video Title: "${videoTitle}"
    Transcript: ${transcript.substring(0, 3000)}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a JSON generator that creates quiz questions in MCQ format. Always respond with a valid JSON array containing question objects with multiple-choice answers. Never include any explanatory text or markdown formatting."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama3-8b-8192",
      temperature: 0.3,
      max_tokens: 1500
    });

    const content = completion.choices[0]?.message?.content || '';

    // Clean up the response to ensure it's valid JSON
    const cleanedContent = content.trim().replace(/```json|```/g, '').trim();

    try {
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      // If parsing fails, attempt to create a structured response
      console.error('JSON parsing failed, attempting to structure response:', parseError);

      // Extract questions using regex as fallback
      const questionRegex = /"question":\s*"(.+?)"/g;
      const optionsRegex = /"options":\s*\[(.+?)\]/g;

      const questions = [...content.matchAll(questionRegex)].map((match, index) => {
        const optionsText = optionsRegex[index]?.[1] || '';
        const options = optionsText.split(/\},\s*\{/).map(optionText => {
          const textMatch = optionText.match(/"text":\s*"(.+?)"/);
          const correctMatch = optionText.match(/"correct":\s*(true|false)/);
          return {
            text: textMatch ? textMatch[1] : '',
            correct: correctMatch ? correctMatch[1] === 'true' : false
          };
        });
        return {
          question: match[1].trim(),
          options
        };
      });

      if (questions.length === 0) {
        throw new Error('Could not extract questions from response');
      }

      return questions;
    }
  } catch (error) {
    console.error('Error in question generation:', error);
    throw new Error('Question generation failed: ' + error.message);
  }
}



// Route to fetch video details and transcript
app.post('/api/process-youtube', async (req, res) => {
  try {
    const { youtubeUrl } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = getVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Fetch video details using ytdl-core
    const videoInfo = await ytdl.getBasicInfo(youtubeUrl);

    // Fetch transcript
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcriptArray || transcriptArray.length === 0) {
      return res.status(404).json({ error: 'No transcript available for this video' });
    }

    const transcript = transcriptArray
    .map(item => item.text)
    .join(' ');

    // Generate questions using Groq
    const questions = await generateQuestionsWithGroq(transcript, videoInfo.videoDetails.title);

    // Add timestamps to questions if available
    const questionsWithTimestamps = questions.map((question, index) => {
      if (transcriptArray[index * 20]) {
        return {
          ...question,
          timestamp: Math.floor(transcriptArray[index * 20].offset / 1000)
        };
      }
      return question;
    });

    res.json({
      videoInfo: {
        title: videoInfo.videoDetails.title,
        thumbnail: videoInfo.videoDetails.thumbnails[0].url,
        duration: videoInfo.videoDetails.lengthSeconds,
        description: videoInfo.videoDetails.description
      },
      transcript,
      questions: questionsWithTimestamps
    });

  } catch (error) {
    console.error('Error processing YouTube video:', error);
    res.status(500).json({
      error: 'Failed to process YouTube video',
      details: error.message
    });
  }
});

async function getFinalUrl(url) {
  try {
    const response = await axios.get(url, { maxRedirects: 5 });
    return response.request.res.responseUrl;
  } catch (error) {
    console.error(`Error fetching URL: ${url}`, error);
    return null;
  }
}


function normalizeYouTubeUrl(url) {
  try {
    const parsedUrl = new URL(url);

    // Remove unnecessary query parameters
    parsedUrl.searchParams.delete('feature');

    // Sort query parameters for consistent comparison
    const sortedParams = new URLSearchParams(parsedUrl.searchParams);
    console.log(sortedParams.toString());
    parsedUrl.search = sortedParams.toString();
    console.log(parsedUrl.toString());
    return parsedUrl.toString();
  } catch (error) {
    console.error('Invalid URL:', url);
    return null;
  }
}

async function areUrlsSame(originalUrl, shortenedUrl) {
  const normalizedOriginalUrl = normalizeYouTubeUrl(originalUrl);
  const ShortenedUrl = await getFinalUrl(shortenedUrl);
  const normalizedShortenedUrl = normalizeYouTubeUrl(ShortenedUrl);

  if (!normalizedOriginalUrl || !normalizedShortenedUrl) {
    console.log('Could not retrieve one or both URLs.');
    return false;
  }

  return normalizedOriginalUrl === normalizedShortenedUrl;
}


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    groqInitialized: !!groq
  });
});
