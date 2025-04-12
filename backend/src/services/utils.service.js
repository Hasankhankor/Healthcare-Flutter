const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('../config/config');

exports.uploadFile = (file, folder = 'profiles') => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!config.allowedFileTypes.includes(file.mimetype)) {
      reject(new Error('Invalid file type'));
    }

    // Validate file size
    if (file.size > config.maxFileSize) {
      reject(new Error('File too large'));
    }

    const uploadDir = path.join(config.uploadPath, folder);

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file
    fs.writeFile(filePath, file.buffer, (err) => {
      if (err) reject(err);
      resolve(`${folder}/${fileName}`);
    });
  });
};

exports.deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const fullPath = path.join(config.uploadPath, filePath);
    fs.unlink(fullPath, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

// Email transport configuration
const transporter = nodemailer.createTransport(config.smtpConfig);

exports.sendEmail = async (options) => {
  const message = {
    from: config.emailFrom,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
    await transporter.sendMail(message);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Email could not be sent');
  }
};

exports.generateAppointmentEmail = (appointmentData, type = 'confirmation') => {
  const templates = {
    confirmation: {
      subject: 'Appointment Confirmation',
      html: `
        <h1>Appointment Confirmed</h1>
        <p>Dear ${appointmentData.patient.name},</p>
        <p>Your appointment has been confirmed with Dr. ${appointmentData.doctor.name}</p>
        <p>Date: ${new Date(appointmentData.date).toLocaleDateString()}</p>
        <p>Time: ${appointmentData.time}</p>
        <p>Location: ${appointmentData.doctor.address}</p>
      `
    },
    reminder: {
      subject: 'Appointment Reminder',
      html: `
        <h1>Appointment Reminder</h1>
        <p>Dear ${appointmentData.patient.name},</p>
        <p>This is a reminder for your appointment tomorrow with Dr. ${appointmentData.doctor.name}</p>
        <p>Date: ${new Date(appointmentData.date).toLocaleDateString()}</p>
        <p>Time: ${appointmentData.time}</p>
        <p>Location: ${appointmentData.doctor.address}</p>
      `
    },
    cancellation: {
      subject: 'Appointment Cancellation',
      html: `
        <h1>Appointment Cancelled</h1>
        <p>Dear ${appointmentData.patient.name},</p>
        <p>Your appointment with Dr. ${appointmentData.doctor.name} has been cancelled.</p>
        <p>Original Date: ${new Date(appointmentData.date).toLocaleDateString()}</p>
        <p>Time: ${appointmentData.time}</p>
      `
    }
  };

  return templates[type];
};