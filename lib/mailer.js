import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: false,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS
  }
});

export const sendVerificationEmail = async (to, token) => {
  const verificationLink = `https://online-payment-system.vercel.app/verify?token=${token}`;

  const mailOptions = {
    from: `"St. Clare Online Enrollment" <${process.env.NODEMAILER_USER}>`,
    to: to,
    subject: 'Verify your email address',
    html: `
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              
            }
            .container {
              background-color: rgba(255, 255, 255, 0.55);
              max-width: 600px;
              margin: 60px auto;
              padding: 40px 30px;
              border-radius: 12px;
              box-shadow: 0 8px 20px rgba(0,0,0,0.25);
              text-align: center;
            }
            .logo {
              width: 90px;
              height: 90px;
              border-radius: 50%;
              background-color: #fff;
              box-shadow: 0 0 8px rgba(0,0,0,0.15);
              object-fit: contain;
              margin-bottom: 20px;
            }
            h3 {
              color:rgb(0, 0, 0);
              margin-bottom: 10px;
              font-size: 24px;
            }
            p {
              color: rgb(0, 0, 0);
              font-size: 16px;
              line-height: 1.6;
              margin: 10px 0;
            }
            a.button {
              display: inline-block;
              padding: 12px 24px;
              margin-top: 20px;
              background-color: #4CAF50;
              color: #fff;
              font-weight: bold;
              text-decoration: none;
              border-radius: 6px;
              font-size: 16px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            a.button:hover {
              background-color: #45a049;
            }
            .footer {
              margin-top: 30px;
              font-size: 12px;
              color: #888;
            }
          </style>
        </head>
        <body style="background: url('https://online-enrollment-system-admin.vercel.app/background.webp')no-repeat center center; background-size: cover;">
          <div class="container">
            <img src="https://online-enrollment-system-admin.vercel.app/icon.webp" alt="St. Clare College Logo" class="logo"/>
            <h3>Welcome to St. Clare College!</h3>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email</a>
            <p>This link will expire in 5 minutes.</p>
            <div class="footer">
              <p>If you did not request this, please ignore this message.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
