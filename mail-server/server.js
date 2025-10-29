const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.post('/send-mail', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    if (!to || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin người nhận hoặc tiêu đề',
      });
    }

    if (!text && !html) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu nội dung mail (text hoặc html)',
      });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'ttuanndz47@gmail.com',
        pass: 'khlo upfj yyos xqbm',
      },
    });

    const mailOptions = {
      from: '"KaynStyle" <ttuanndz47@gmail.com>',
      to,
      subject,
      text: text || 'Vui lòng xem nội dung HTML để biết chi tiết.',
      html: html || `<p>${text}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    res.json({ success: true, message: 'Email đã gửi thành công!' });
  } catch (error) {
    console.error('❌ Lỗi gửi mail:', error);
    res.status(500).json({
      success: false,
      message: 'Gửi mail thất bại',
      error: error.message,
    });
  }
});

app.listen(PORT, () => console.log(`🚀 Mail server chạy trên port ${PORT}`));
