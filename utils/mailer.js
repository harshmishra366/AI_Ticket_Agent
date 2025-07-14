import nodemailer from "nodemailer";

export const sendmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,
      port: process.env.MAILTRAP_SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_SMTP_USER, // generated ethereal user
        pass: process.env.MAILTRAP_SMTP_PASSWORD, // generated ethereal passwor d
      },
    });
    const info = await transporter.sendMail({
    from: '"AI Assistant" <',
    to,
    subject,
    text, // plain‑text body
    
  });

  console.log("Message sent:", info.messageId);
  return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};
