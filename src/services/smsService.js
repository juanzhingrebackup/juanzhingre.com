import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Fix: nodemailer.createTransport (not createTransporter)
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to, subject, message) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to,
        subject,
        text: message,
        html: message.replace(/\n/g, '<br>'),
      };

      const result = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  // Email Templates
  smsFailureNotificationDev(appointmentDetails, smsError) {
    const subject = 'SMS Failure - Appointment Booking Issue';
    const message = `
SMS Sending Failed for Appointment Booking

Appointment Details:
- Name: ${appointmentDetails.name}
- Phone: ${appointmentDetails.phone}
- Service: ${appointmentDetails.cut}
- Day: ${appointmentDetails.day}
- Time: ${appointmentDetails.time}
- Location: ${appointmentDetails.location}
${appointmentDetails.address ? `- Address: ${appointmentDetails.address}` : ''}

SMS Error Details:
${smsError}

Timestamp: ${new Date().toISOString()}
Automated Message`.trim();

    return { subject, message };
  }

  smsFailureNotificationClient(appointmentDetails) {
    const subject = 'SMS Notification Failed - Manual Follow-up Required';
    const message = `
Hello,

A customer tried to book an appointment but the SMS confirmation failed to send.

Customer Details:
- Name: ${appointmentDetails.name}
- Phone: ${appointmentDetails.phone}
- Service: ${appointmentDetails.cut}
- Day: ${appointmentDetails.day}
- Time: ${appointmentDetails.time}
- Location: ${appointmentDetails.location}
${appointmentDetails.address ? `- Address: ${appointmentDetails.address}` : ''}

Please contact the customer directly to confirm their appointment.

Automated Message`.trim();

    return { subject, message };
  }

  appointmentReminder(appointmentDetails) {
    const subject = 'New Appointment Booking Reminder';
    const message = `
New Appointment Booked!

Customer Details:
- Name: ${appointmentDetails.name}
- Phone: ${appointmentDetails.phone}
- Service: ${appointmentDetails.cut}
- Day: ${appointmentDetails.day}
- Time: ${appointmentDetails.time}
- Location: ${appointmentDetails.location}
${appointmentDetails.address ? `- Address: ${appointmentDetails.address}` : ''}

The customer has been sent an SMS confirmation.

Timestamp: ${new Date().toISOString()}
Automated Message`.trim();

    return { subject, message };
  }

  generalNotification(subject, message) {
    return { subject, message };
  }

  // Email Service Methods
  async sendSmsFailureNotificationDev(appointmentDetails, smsError) {
    const { subject, message } = this.smsFailureNotificationDev(appointmentDetails, smsError);
    return await this.sendEmail(process.env.EMAIL_FROM, subject, message);
  }

  async sendSmsFailureNotificationClient(appointmentDetails) {
    const { subject, message } = this.smsFailureNotificationClient(appointmentDetails);
    return await this.sendEmail(process.env.EMAIL_FROM, subject, message);
  }

  async sendAppointmentReminder(appointmentDetails) {
    const { subject, message } = this.appointmentReminder(appointmentDetails);
    return await this.sendEmail(process.env.EMAIL_FROM, subject, message);
  }

  async sendGeneralNotification(subject, message) {
    const { subject: finalSubject, message: finalMessage } = this.generalNotification(subject, message);
    return await this.sendEmail(process.env.EMAIL_FROM, finalSubject, finalMessage);
  }
}

export default new EmailService(); // By John Michael
