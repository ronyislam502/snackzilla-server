import nodemailer from "nodemailer";
import config from "../config";

const sendEmail = async (email: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com.",
    port: 587,
    secure: config.NODE_ENV === "production",
    auth: {
      user: config.sender_email,
      pass: config.sender_app_password,
    },
  });

  await transporter.sendMail({
    from: '"SnackZilla" <ronyislam502@gmail.com>', // sender address
    to: email,
    subject,
    text: "",
    html,
  });
};

export default sendEmail;
