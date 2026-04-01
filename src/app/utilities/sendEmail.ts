import nodemailer from "nodemailer";
import config from "../config";

const sendEmail = async (email: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: config.sender_email,
      pass: config.sender_app_password,
    },
  });

  await transporter.sendMail({
    from: `"SnackZilla" <${config?.sender_email}>`, // sender address
    to: email,
    subject,
    text: "",
    html,
  });
};

export default sendEmail;
