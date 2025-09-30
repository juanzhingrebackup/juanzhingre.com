// Using Node.js built-in fetch for Vercel compatibility

class SMSService {
  constructor() {
    this.apiKey = process.env.TEXTBELT_KEY;
    this.baseUrl = 'https://textbelt.com';
  }

  formatPhoneNumber(phone) {
    let cleaned = phone.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.length === 10) return `+1${cleaned}`;
    if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  async sendSMS(phone, message) {
    try {
      const requestUrl = `${this.baseUrl}/text`;
      const formData = new URLSearchParams();
      formData.append('phone', phone);
      formData.append('message', message);
      formData.append('key', this.apiKey);

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json();
      return {
        success: !!data.success,
        textId: data.textId,
        error: data.error,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Templates
  appointmentConfirmation(appointmentDetails) {
    const { name, confirmationCode, cut, day, time, location, address } = appointmentDetails;
    const displayAddress = location === 'at location' ? process.env.BUSINESS_ADDRESS : address;

    let msg = `Hey ${name}! Your ${cut} appointment is booked!\n\n`;
    msg += `- Date: ${day} at ${time}\n`;
    msg += `- Location: ${displayAddress}\n\n`;
    msg += `🔐 Confirmation Code: ${confirmationCode}\n\n`;
    msg += `Please enter this code on the website to confirm your booking.\n\n`;
    msg += `Thank you for choosing Playday Cuts! Text ${process.env.BUSINESS_PHONE} for questions.`;
    return msg;
  }

  businessNotification(appointmentDetails) {
    const { name, phone, cut, day, time, location, address } = appointmentDetails;
    const displayAddress = location === 'at location' ? process.env.BUSINESS_ADDRESS : address;

    let msg = `NEW APPOINTMENT BOOKING\n\n`;
    msg += `- Customer: ${name}\n`;
    msg += `- Phone: ${phone}\n`;
    msg += `- Service: ${cut}\n`;
    msg += `- Date: ${day}\n`;
    msg += `- Time: ${time}\n`;
    if (displayAddress) msg += `- Location: ${displayAddress}\n`;
    msg += `\n- Booked at: ${new Date().toLocaleString()}`;
    return msg;
  }

  appointmentCancellation(appointmentDetails) {
    const { name, phone, cut, day, time, location, address } = appointmentDetails;
    const displayAddress = location === 'at location' ? process.env.BUSINESS_ADDRESS : address;

    let msg = `❌ APPOINTMENT CANCELLED\n\n`;
    msg += `- Customer: ${name}\n`;
    msg += `- Phone: ${phone}\n`;
    msg += `- Service: ${cut}\n`;
    msg += `- Date: ${day}\n`;
    msg += `- Time: ${time}\n`;
    msg += `- Location: ${location}\n`;
    if (displayAddress) msg += `- Address: ${displayAddress}\n`;
    msg += `\n- Cancelled at: ${new Date().toLocaleString()}`;
    return msg;
  }

  // Service methods
  async sendAppointmentConfirmation(appointmentDetails) {
    const formatted = this.formatPhoneNumber(appointmentDetails.phone);
    const message = this.appointmentConfirmation(appointmentDetails);
    return await this.sendSMS(formatted, message);
  }

  async sendBusinessNotification(appointmentDetails) {
    const businessPhone = process.env.BUSINESS_PHONE;
    if (!businessPhone) return { success: false, error: 'Business phone not configured' };
    const formatted = this.formatPhoneNumber(businessPhone);
    const message = this.businessNotification(appointmentDetails);
    return await this.sendSMS(formatted, message);
  }

  async sendAppointmentCancellation(appointmentDetails) {
    const formatted = this.formatPhoneNumber(appointmentDetails.phone);
    const message = this.appointmentCancellation(appointmentDetails);
    return await this.sendSMS(formatted, message);
  }
}

const smsService = new SMSService();
// Export both named and default to avoid ESM/CJS shape issues.
export { SMSService, smsService };
export default smsService; 
// By John Michael