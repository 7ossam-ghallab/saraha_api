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
      from: process.env.EMAIL_USER,
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
  sendEmailService({ to, subject, html, attachments })
    .then((info) => {
      if (!info || info.messageId) {
        console.log(`[Email] sent to ${to}: ${info?.messageId ?? "ok"}`);
      } else {
        console.error(`[Email] failed to send to ${to}: ${info.message}`);
      }
    })
    .catch((err) => {
      console.error(`[Email] failed to send to ${to}: ${err.message}`);
    });
});