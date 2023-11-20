import twilio from 'twilio';

// Your Twilio Account SID and Auth Token
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Create a Twilio client
const client = twilio(accountSid, authToken);

// Function to send an SMS
async function sendSMS(to, body) {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio phone number
      to,
    });
  } catch (e) {
    console.log(e);
  }
}

export default sendSMS;
