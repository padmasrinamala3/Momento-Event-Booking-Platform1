const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Review = require('./models/Review');

async function checkNewData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const bookings = await Booking.find().sort({ createdAt: -1 });
    const reviews = await Review.find().sort({ createdAt: -1 });
    
    console.log(`📊 CURRENT DATA IN MONGODB:`);
    console.log(`\n🎫 BOOKINGS (${bookings.length} total):`);
    
    bookings.forEach((b, i) => {
      const timeAgo = new Date() - new Date(b.createdAt);
      const minutes = Math.floor(timeAgo / 60000);
      console.log(`\n${i+1}. ${b.name} - ${b.event}`);
      console.log(`   📅 ${b.date} | 📞 ${b.phone}`);
      console.log(`   💰 ₹${b.price.toLocaleString('en-IN')} | 🎯 ${b.services}`);
      console.log(`   🕐 Created: ${minutes} minutes ago`);
      console.log(`   🆔 ID: ${b._id}`);
    });

    console.log(`\n⭐ REVIEWS (${reviews.length} total):`);
    
    reviews.forEach((r, i) => {
      const timeAgo = new Date() - new Date(r.createdAt);
      const minutes = Math.floor(timeAgo / 60000);
      console.log(`\n${i+1}. ${r.name}`);
      console.log(`   📝 "${r.text}"`);
      console.log(`   ⭐ ${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}`);
      console.log(`   🕐 Created: ${minutes} minutes ago`);
      console.log(`   🆔 ID: ${r._id}`);
    });

    console.log('\n💡 TIP: Run this script again after you submit a booking to see if it appears!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkNewData();
