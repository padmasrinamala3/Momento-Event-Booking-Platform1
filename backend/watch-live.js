const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Review = require('./models/Review');

async function watchLive() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
    console.log('👀 WATCHING LIVE FOR NEW BOOKINGS & REVIEWS...');
    console.log('📝 Now submit a booking from frontend!\n');

    let lastBookingId = null;
    let lastReviewId = null;

    // Get latest IDs
    const latestBooking = await Booking.findOne().sort({ createdAt: -1 });
    const latestReview = await Review.findOne().sort({ createdAt: -1 });
    
    if (latestBooking) lastBookingId = latestBooking._id.toString();
    if (latestReview) lastReviewId = latestReview._id.toString();

    console.log(`📊 Current state: ${await Booking.countDocuments()} bookings, ${await Review.countDocuments()} reviews\n`);

    setInterval(async () => {
      try {
        const newBooking = await Booking.findOne().sort({ createdAt: -1 });
        const newReview = await Review.findOne().sort({ createdAt: -1 });

        if (newBooking && newBooking._id.toString() !== lastBookingId) {
          console.log('🎉 NEW BOOKING DETECTED!');
          console.log(`   👤 Name: ${newBooking.name}`);
          console.log(`   🎪 Event: ${newBooking.event}`);
          console.log(`   📅 Date: ${newBooking.date}`);
          console.log(`   📞 Phone: ${newBooking.phone}`);
          console.log(`   🎯 Services: ${newBooking.services}`);
          console.log(`   💰 Price: ₹${newBooking.price.toLocaleString('en-IN')}`);
          console.log(`   🆔 ID: ${newBooking._id}`);
          console.log(`   ⏰ Time: ${new Date().toLocaleTimeString()}\n`);
          lastBookingId = newBooking._id.toString();
        }

        if (newReview && newReview._id.toString() !== lastReviewId) {
          console.log('⭐ NEW REVIEW DETECTED!');
          console.log(`   👤 Name: ${newReview.name}`);
          console.log(`   📝 "${newReview.text}"`);
          console.log(`   ⭐ Rating: ${'★'.repeat(newReview.stars)}${'☆'.repeat(5-newReview.stars)}`);
          console.log(`   🆔 ID: ${newReview._id}`);
          console.log(`   ⏰ Time: ${new Date().toLocaleTimeString()}\n`);
          lastReviewId = newReview._id.toString();
        }

      } catch (error) {
        console.error('❌ Error:', error.message);
      }
    }, 2000);

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

watchLive();
