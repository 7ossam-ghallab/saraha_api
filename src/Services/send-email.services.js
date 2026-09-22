import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";

export const sendEmailService = async ({
  to,
  subject,
  html,
  attachments = [],
}) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const info = await transporter.sendMail({
      from: "Maddison Foo Koch 👻",
      to,
      subject,
      html,
      attachments,
    });

    return info;
  } catch (error) {
    console.error(error.message);
    return error;
  }
};

export const emitter = new EventEmitter();

emitter.on("sendMail", (...args) => {
  const { to, subject, html, attachments } = args[0];
  sendEmailService({ to, subject, html, attachments });
  console.log("Email sent successfully!");
});
