const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/send-mail', async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ success: false, message: 'Thiếu thông tin gửi mail' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'ttuanndz47@gmail.com',
      pass: 'hvtz kmjh wpvt zama', 
    },
  });

  try {
    const info = await transporter.sendMail({
      from: '"KaynStyle" <ttuanndz47@gmail.com>',
      to,
      subject,
      text,
      html: `<p>${text}</p>`,
    });
    console.log('Email sent:', info.messageId);
    res.json({ success: true, message: 'Email đã gửi thành công!' });
  } catch (error) {
    console.error('Lỗi gửi mail:', error);
    res.status(500).json({ success: false, message: 'Gửi mail thất bại', error: error.message });
  }
});

app.listen(3001, () => console.log('Server chạy trên port 3001'));
