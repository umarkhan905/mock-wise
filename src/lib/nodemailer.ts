import nodemailer from "nodemailer";

export const transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.NEXT_PUBLIC_MAILTRAP_USER,
    pass: process.env.NEXT_PUBLIC_MAILTRAP_PASS,
  },
});
