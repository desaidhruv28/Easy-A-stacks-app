// migrations/migrate.js
const mongoose = require('mongoose');
const { Video, User, VideoUserQuiz, Payment, Transaction } = require('../models');

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create indexes for better query performance
    await Promise.all([
      // Video indexes
      Video.collection.createIndex({ video_title: 1 }),
      Video.collection.createIndex({ video_url: 1 }, { unique: true }),

      // User indexes
      User.collection.createIndex({ stack_key: 1 }, { unique: true }),

      // VideoUserQuiz indexes
      VideoUserQuiz.collection.createIndex({ userId: 1, videoId: 1 }),
      VideoUserQuiz.collection.createIndex({ quizDate: 1 }),

      // Payment indexes
      Payment.collection.createIndex({ videoId: 1 }),
      Payment.collection.createIndex({ createdAt: 1 }),

      // Transaction indexes
      Transaction.collection.createIndex({ userId: 1, videoId: 1 }),
      Transaction.collection.createIndex({ paymentStatus: 1 }),
      Transaction.collection.createIndex({ paymentDate: 1 })
    ]);

    console.log('Database indexes created successfully');

    // Optional: Add some initial data
    // const sampleData = await seedSampleData();
    // console.log('Sample data seeded successfully');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.connection.close();
  }
}

async function seedSampleData() {
  // Sample data seeding function
  const user = await User.create({
    name: 'Test User',
    stack_key: 'test-key-123'
  });

  const video = await Video.create({
    video_url: 'https://youtube.com/watch?v=test',
    video_title: 'Test Video',
    video_duration: 300,
    video_thumbnail: 'https://example.com/thumbnail.jpg'
  });

  await VideoUserQuiz.create({
    videoId: video._id,
    userId: user._id,
    score: 80,
    attempts: true,
    quizDate: new Date()
  });

  await Payment.create({
    videoId: video._id,
    totalPaymentValue: 99.99,
    currency: 'USD'
  });

  await Transaction.create({
    userId: user._id,
    videoId: video._id,
    sentAmount: 99.99,
    paymentStatus: 'completed',
    paymentDate: new Date()
  });
}

// Run migration
migrate();