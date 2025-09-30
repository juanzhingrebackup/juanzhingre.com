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
            const url = `${this.baseUrl}/text`;
            const form = new URLSearchParams();
            form.append('phone', phone);
            form.append('message', message);
            form.append('key', this.apiKey);

            const resp = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: form.toString(),
            });
            const data = await resp.json();
            return { success: !!data.success, textId: data.textId, error: data.error };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

  // Templates
    appointmentConfirmation(d) {
        const displayAddress = d.location === 'at location' ? process.env.BUSINESS_ADDRESS : d.address;
        let msg = `Hey ${d.name}! Your ${d.cut} appointment is booked!\n\n`;
        msg += `- Date: ${d.day} at ${d.time}\n`;
        msg += `- Location: ${displayAddress}\n\n`;
        msg += `🔐 Confirmation Code: ${d.confirmationCode}\n\n`;
        msg += `Please enter this code on the website to confirm your booking.\n\n`;
        msg += `Thank you for choosing Playday Cuts! Text ${process.env.BUSINESS_PHONE} for questions.`;
        return msg;
    }

    businessNotification(d) {
        const displayAddress = d.location === 'at location' ? process.env.BUSINESS_ADDRESS : d.address;
        let msg = `NEW APPOINTMENT BOOKING\n\n`;
        msg += `- Customer: ${d.name}\n`;
        msg += `- Phone: ${d.phone}\n`;
        msg += `- Service: ${d.cut}\n`;
        msg += `- Date: ${d.day}\n`;
        msg += `- Time: ${d.time}\n`;
        if (displayAddress) msg += `- Location: ${displayAddress}\n`;
        msg += `\n- Booked at: ${new Date().toLocaleString()}`;
        return msg;
    }

    appointmentCancellation(d) {
        const displayAddress = d.location === 'at location' ? process.env.BUSINESS_ADDRESS : d.address;
        let msg = `❌ APPOINTMENT CANCELLED\n\n`;
        msg += `- Customer: ${d.name}\n`;
        msg += `- Phone: ${d.phone}\n`;
        msg += `- Service: ${d.cut}\n`;
        msg += `- Date: ${d.day}\n`;
        msg += `- Time: ${d.time}\n`;
        msg += `- Location: ${d.location}\n`;
        if (displayAddress) msg += `- Address: ${displayAddress}\n`;
        msg += `\n- Cancelled at: ${new Date().toLocaleString()}`;
        return msg;
    }

  // Service methods
    async sendAppointmentConfirmation(d) {
        const formatted = this.formatPhoneNumber(d.phone);
        const message = this.appointmentConfirmation(d);
        return await this.sendSMS(formatted, message);
    }

    async sendBusinessNotification(d) {
        const businessPhone = process.env.BUSINESS_PHONE;
        if (!businessPhone) return { success: false, error: 'Business phone not configured' };
        const formatted = this.formatPhoneNumber(businessPhone);
        const message = this.businessNotification(d);
        return await this.sendSMS(formatted, message);
    }

    async sendAppointmentCancellation(d) {
        const formatted = this.formatPhoneNumber(d.phone);
        const message = this.appointmentCancellation(d);
        return await this.sendSMS(formatted, message);
    }
}

const smsService = new SMSService();
export { SMSService, smsService };
export default smsService; // By John Michael