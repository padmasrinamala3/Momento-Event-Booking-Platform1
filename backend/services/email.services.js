const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
});

const sendBookingEmail = async (toEmail, booking) => {
  try {
    await transporter.sendMail({
      from: `"MomentO Events" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `✦ Booking Confirmed — ${booking.event} [${booking._id}]`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#0d0d0d;color:#ddd;padding:32px;border-radius:8px;">
          <h1 style="color:#C9A84C;font-family:Georgia,serif;font-size:28px;">MomentO</h1>
          <p style="color:#888;font-size:12px;letter-spacing:2px;">PREMIUM EVENT PLANNING</p>
          <hr style="border-color:rgba(201,168,76,0.2);margin:20px 0;">
          <h2 style="color:#fff;">🎉 Booking Confirmed!</h2>
          <p>Hello <strong style="color:#C9A84C;">${booking.name}</strong>,</p>
          <p>Your booking has been confirmed successfully!</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">Booking ID</td><td style="color:#C9A84C;font-size:13px;">${booking._id}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">Event</td><td style="color:#ddd;font-size:13px;">${booking.event}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">Date</td><td style="color:#ddd;font-size:13px;">${booking.date}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">Venue</td><td style="color:#ddd;font-size:13px;">${booking.venue || "TBD"}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">Total</td><td style="color:#C9A84C;font-size:15px;font-weight:bold;">₹${booking.price?.toLocaleString("en-IN")}</td></tr>
            <tr><td style="padding:8px 0;color:#888;font-size:13px;">Payment</td><td style="color:#ddd;font-size:13px;">${booking.payMode}</td></tr>
          </table>
          <hr style="border-color:rgba(201,168,76,0.2);margin:20px 0;">
          <p style="color:#888;font-size:12px;">Thank you for choosing MomentO! We will contact you shortly.</p>
          <p style="color:#C9A84C;font-size:12px;">📞 +91 81062 96055 · ✉ momento.events@gmail.com</p>
          <p style="color:#444;font-size:11px;margin-top:20px;">✦ we make your moments magical ✦</p>
        </div>
      `,
    });
    console.log("✅ Booking email sent to", toEmail);
  } catch (err) {
    console.error("❌ Email error:", err.message);
  }
};

module.exports = { sendBookingEmail };