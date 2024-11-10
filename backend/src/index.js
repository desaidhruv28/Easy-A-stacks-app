const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes');
const { Video, User, VideoUserQuiz, Payment, Transaction } = require('./models');


const Groq = require('groq-sdk');
const axios = require('axios');
const ytdl = require('ytdl-core');  // Changed to ytdl-core instead of youtube-dl-exec
const { YoutubeTranscript } = require('youtube-transcript');
const {Types} = require("mongoose");
const { distributeLeaderboardRewards, initCronJobs } = require('./leaderboardPayment');

require('dotenv').config();

async function run() {
  await distributeLeaderboardRewards();
}
run();

dotenv.config();

async function setupIndexes() {
  try {
    await Promise.all([
      Video.collection.createIndex({ video_title: 1 }),
      Video.collection.createIndex({ video_url: 1 }, { unique: true }),
      User.collection.createIndex({ stack_key: 1 }, { unique: true }),
      VideoUserQuiz.collection.createIndex({ userId: 1, videoId: 1 }),
      VideoUserQuiz.collection.createIndex({ quizDate: 1 }),
      Payment.collection.createIndex({ videoId: 1 }),
      Payment.collection.createIndex({ createdAt: 1 }),
      Transaction.collection.createIndex({ userId: 1, videoId: 1 }),
      Transaction.collection.createIndex({ paymentStatus: 1 }),
      Transaction.collection.createIndex({ paymentDate: 1 })
    ]);
    console.log('Database indexes ensured');
  } catch (error) {
    console.error('Error setting up indexes:', error);
  }
}

// Call it after database connection
connectDB().then(() => {
  setupIndexes();
});

const port = process.env.PORT || 5001;
const app = express();


app.use(cors());
app.use(express.json());

// After your Express app initialization
// initCronJobs();


console.log('Automated payment service started');


// Initialize Groq with error handling
let groq;
try {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
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

    // // Save video details to a database
    // const video = new Video({
    //   video_url: youtubeUrl,
    //   video_title: videoInfo.videoDetails.title,
    //   video_duration: videoInfo.videoDetails.lengthSeconds,
    //   video_thumbnail: videoInfo.videoDetails.thumbnails[0].url
    // });
    // await video.save();

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


// Add the route handler for getting all users
app.get('/api/users/list', async (req, res) => {
  try {
    // Extract query parameters for pagination and filtering
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'name',
      order = 'asc'
    } = req.query;

    // Create filter object for search
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case-insensitive name search
        { email: { $regex: search, $options: 'i' } }  // Case-insensitive email search
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create sort object
    const sortObject = {};
    sortObject[sortBy] = order === 'asc' ? 1 : -1;

    // Fetch users with pagination
    const users = await User.find(filter)
    .select('_id name') // Only select necessary fields
    .sort(sortObject)
    .skip(skip)
    .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // Transform data to return only required fields
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
    }));

    res.json({
      success: true,
      data: {
        users: transformedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      details: error.message
    });
  }
});

// Add a route to get a specific user by ID
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
    .select('_id name');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      details: error.message
    });
  }
});

// Add the route handler for getting all videos
app.get('/api/videos', async (req, res) => {
  try {
    // Extract query parameters for pagination and filtering
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'video_title',
      order = 'asc'
    } = req.query;

    // Create filter object for search
    const filter = {};
    if (search) {
      filter.$or = [
        { video_title: { $regex: search, $options: 'i' } }, // Case-insensitive title search
        { video_url: { $regex: search, $options: 'i' } }    // Case-insensitive URL search
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Create sort object
    const sortObject = {};
    sortObject[sortBy] = order === 'asc' ? 1 : -1;

    // Fetch videos with pagination
    const videos = await Video.find(filter)
    .select('_id video_url video_title video_duration video_thumbnail') // Only select required fields
    .sort(sortObject)
    .skip(skip)
    .limit(parseInt(limit));

    // Get total count for pagination
    const totalVideos = await Video.countDocuments(filter);
    const totalPages = Math.ceil(totalVideos / parseInt(limit));

    // Transform data to ensure consistent format
    const transformedVideos = videos.map(video => ({
      _id: video._id,
      video_url: video.video_url,
      video_title: video.video_title,
      video_duration: video.video_duration,
      video_thumbnail: video.video_thumbnail
    }));

    res.json({
      success: true,
      data: {
        videos: transformedVideos,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVideos,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch videos',
      details: error.message
    });
  }
});

// Add a route to get a specific video by ID
app.get('/api/videos/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId)
    .select('_id video_url video_title video_duration video_thumbnail');

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found'
      });
    }

    res.json({
      success: true,
      data: {
        _id: video._id,
        video_url: video.video_url,
        video_title: video.video_title,
        video_duration: video.video_duration,
        video_thumbnail: video.video_thumbnail
      }
    });

  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch video',
      details: error.message
    });
  }
});


// First, create a middleware to check if user has already attempted the quiz
const checkQuizAttempt = async (req, res, next) => {
  try {
    const { userId, videoId } = req.body;

    const existingAttempt = await VideoUserQuiz.findOne({
      userId,
      videoId,
      attempts: true
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        error: 'Quiz already attempted',
        details: 'Users are not allowed to retake this quiz'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error checking quiz attempt',
      details: error.message
    });
  }
};


// First, create the route handler
app.post('/api/submit-quiz-scores', checkQuizAttempt, async (req, res) => {
  try {
    const {
      userId,
      videoId,
      userScore,
      maxScore
    } = req.body;

    // Validate required fields
    if (!userId || !videoId || userScore === undefined || !maxScore) {
      return res.status(400).json({
        error: 'Missing required fields',
        requiredFields: ['userId', 'videoId', 'score', 'maxScore']
      });
    }

    // Validate score is within possible range
    if (userScore < 0 || userScore > maxScore) {
      return res.status(400).json({
        error: 'Invalid score',
        details: `Score must be between 0 and ${maxScore}`
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        error: 'Video not found'
      });
    }

    // Check if user exists
    const userVideoExist = await VideoUserQuiz.findById(userId, videoId);
    if (userVideoExist) {
      return res.status(404).json({
        error: 'User found'
      });
    }

    // Create new quiz result with current datetime
    const quizResult = new VideoUserQuiz({
      userId: userId,
      videoId: videoId,
      score: userScore,
      attempts: true, // Mark as attempted
      quizDate: new Date().toISOString() // Store as ISO string for datetime format
    });

    // Save to database
    await quizResult.save();

    res.status(201).json({
      success: true,
      message: 'Quiz score saved successfully',
      data: {
        score: quizResult.score,
        attempts: quizResult.attempts,
        quizDate: quizResult.quizDate
      }
    });

  } catch (error) {
    console.error('Error saving quiz score:', error);
    res.status(500).json({
      error: 'Failed to save quiz score',
      details: error.message
    });
  }
});


// Add route for video-specific leaderboard
app.get('/api/leaderboard/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const leaderboard = await VideoUserQuiz.aggregate([
      {
        $match: {
          videoId: new Types.ObjectId(videoId)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { score: -1, quizDate: 1 }
      },
      {
        $skip: skip
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          _id: 1,
          'user.name': 1,
          score: 1,
          quizDate: 1
        }
      }
    ]);

    const video = await Video.findById(videoId).select('video_title');

    res.json({
      success: true,
      data: {
        videoTitle: video.video_title,
        leaderboard: leaderboard.map((entry, index) => ({
          rank: skip + index + 1,
          userId: entry.user._id,
          name: entry.user.name,
          score: entry.score,
          quizDate: entry.quizDate
        }))
      }
    });

  } catch (error) {
    console.error('Error generating video leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate video leaderboard',
      details: error.message
    });
  }
});

