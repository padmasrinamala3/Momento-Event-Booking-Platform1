const mongoose = require('mongoose');
require('dotenv').config();
const Booking = require('./models/Booking');
const Review = require('./models/Review');

async function checkMyBookings() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const bookings = await Booking.find().sort({ createdAt: -1 });
    const reviews = await Review.find().sort({ createdAt: -1 });
    
    console.log(`📊 YOUR DATA IN MONGODB:`);
    console.log(`================================`);
    
    if (bookings.length === 0) {
      console.log('\n📭 No bookings found');
    } else {
      console.log(`\n🎫 BOOKINGS (${bookings.length} total):`);
      bookings.forEach((b, i) => {
        const created = new Date(b.createdAt);
        const timeAgo = Math.floor((new Date() - created) / 60000);
        console.log(`\n${i+1}. 🎪 ${b.event}`);
        console.log(`   👤 Name: ${b.name}`);
        console.log(`   📞 Phone: ${b.phone}`);
        console.log(`   📅 Date: ${b.date}`);
        console.log(`   🎯 Services: ${b.services}`);
        console.log(`   💰 Price: ₹${b.price.toLocaleString('en-IN')}`);
        console.log(`   🕐 Created: ${timeAgo} minutes ago`);
        console.log(`   🆔 ID: ${b._id}`);
      });
    }
    
    if (reviews.length === 0) {
      console.log('\n📭 No reviews found');
    } else {
      console.log(`\n⭐ REVIEWS (${reviews.length} total):`);
      reviews.forEach((r, i) => {
        const created = new Date(r.createdAt);
        const timeAgo = Math.floor((new Date() - created) / 60000);
        console.log(`\n${i+1}. 👤 ${r.name}`);
        console.log(`   📝 "${r.text}"`);
        console.log(`   ⭐ ${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}`);
        console.log(`   🕐 Created: ${timeAgo} minutes ago`);
        console.log(`   🆔 ID: ${r._id}`);
      });
    }
    
    console.log('\n💡 TIPS:');
    console.log('   • Frontend: http://localhost:3000');
    console.log('   • Backend: http://localhost:5000');
    console.log('   • Login with: user@demo.com / demo123');
    console.log('   • Run this script again to see new data!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

checkMyBookings();
