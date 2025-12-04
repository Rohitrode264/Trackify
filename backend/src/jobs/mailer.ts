import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com',
  port: 465,               // or 587 if you prefer STARTTLS
  secure: true,            // true if port=465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS  // your email account password
  }
});

export async function sendMail(to:string, subject:string, html:string) {
  try{
  await transporter.sendMail({
    from: 'aroma@citspray.com',
    to,
    subject,
    html
  });
  console.log(`Mail sent to ${to}`);
}
catch(err){
  console.log("error while sending the mail : ",err)
}
}
