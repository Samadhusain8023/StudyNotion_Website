const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,  // SMTP Host
            port: process.env.MAIL_PORT || 587,  // Default to 587 (TLS)
            secure: process.env.MAIL_PORT == 465,  // Secure for port 465
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false, // Bypass self-signed certificate error
            }
        });

        let info = await transporter.sendMail({
            from: `"Studynotion || Codehelp - Samad Husain" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body,
        });

        // console.log("Email sent successfully:", info.messageId);
         console.log("Mail sent successfully");
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        return null;
    }
};

module.exports = mailSender;
