import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_PORT === '465',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
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
      return { success: false, error: error.message || 'Unknown error occurred' };
    }
  }

  smsFailureNotificationDev(d, smsError) {
    const subject = 'SMS Failure - Appointment Booking Issue';
    const message = `
SMS Sending Failed for Appointment Booking

Appointment Details:
- Name: ${d.name}
- Phone: ${d.phone}
- Service: ${d.cut}
- Day: ${d.day}
- Time: ${d.time}
- Location: ${d.location}
${d.address ? `- Address: ${d.address}` : ''}

SMS Error Details:
${smsError}

Timestamp: ${new Date().toISOString()}
Automated Message`.trim();
    return { subject, message };
  }

  smsFailureNotificationClient(d) {
    const subject = 'SMS Notification Failed - Manual Follow-up Required';
    const message = `
Hello,

A customer tried to book an appointment but the SMS confirmation failed to send.

Customer Details:
- Name: ${d.name}
- Phone: ${d.phone}
- Service: ${d.cut}
- Day: ${d.day}
- Time: ${d.time}
- Location: ${d.location}
${d.address ? `- Address: ${d.address}` : ''}

Please contact the customer directly to confirm their appointment.

Automated Message`.trim();
    return { subject, message };
  }

  appointmentReminder(d) {
    const subject = 'New Appointment Booking Reminder';
    const message = `
New Appointment Booked!

Customer Details:
- Name: ${d.name}
- Phone: ${d.phone}
- Service: ${d.cut}
- Day: ${d.day}
- Time: ${d.time}
- Location: ${d.location}
${d.address ? `- Address: ${d.address}` : ''}

The customer has been sent an SMS confirmation.

Timestamp: ${new Date().toISOString()}
Automated Message`.trim();
    return { subject, message };
  }

  generalNotification(subject, message) {
    return { subject, message };
  }

  async sendSmsFailureNotificationDev(d, smsError) {
    const { subject, message } = this.smsFailureNotificationDev(d, smsError);
    return await this.sendEmail(process.env.EMAIL_FROM, subject, message);
  }

  async sendSmsFailureNotificationClient(d) {
    const { subject, message } = this.smsFailureNotificationClient(d);
    return await this.sendEmail(process.env.EMAIL_FROM, subject, message);
  }

  async sendAppointmentReminder(d) {
    const { subject, message } = this.appointmentReminder(d);
    return await this.sendEmail(process.env.EMAIL_FROM, subject, message);
  }

  async sendGeneralNotification(subject, message) {
    const { subject: s, message: m } = this.generalNotification(subject, message);
    return await this.sendEmail(process.env.EMAIL_FROM, s, m);
  }
}

export default new EmailService(); // By John Michael
