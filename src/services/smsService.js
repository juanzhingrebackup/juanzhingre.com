class SMSService {
    constructor() {
        this.apiKey = process.env.TEXTBELT_KEY;
        this.baseUrl = "https://textbelt.com";
    }

    // Helper method to format phone numbers
    formatPhoneNumber(phone) {
        let cleaned = phone.replace(/[^\d+]/g, "");
        if (cleaned.startsWith("+")) return cleaned;
        if (cleaned.length === 10) return `+1${cleaned}`;
        if (cleaned.length === 11 && cleaned.startsWith("1"))
            return `+${cleaned}`;
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }

    // Helper method to send an SMS message with Textbelt API
    async sendSMS(phone, message) {
        try {
            const url = `${this.baseUrl}/text`;
            const form = new URLSearchParams();
            form.append("phone", phone);
            form.append("message", message);
            form.append("key", this.apiKey);

            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: form.toString()
            });
            const data = await resp.json();
            return {
                success: !!data.success,
                textId: data.textId,
                error: data.error
            };
        } catch (err) {
            return { success: false, error: err.message };
        }
    }

    // Template for appointment confirmation
    appointmentConfirmation(d) {
        // Check if location is "At Location" (case-insensitive)
        const isAtLocation = d.location && d.location.toLowerCase().includes("at location");
        const displayAddress = isAtLocation
            ? process.env.NEXT_PUBLIC_BUSINESS_ADDRESS
            : d.address;
        const address = displayAddress || "1776 Sego Ln, Provo, UT";
        const fullDate = d.date ? `${d.day}, ${d.date}` : d.day;
        let msg = `Hey ${d.name}! Your ${d.cut} appointment is booked!\n\n`;
        msg += `- Date: ${fullDate} at ${d.time}\n`;
        msg += `- Location: ${address}\n`;
        if (d.notes) {
            msg += `- Notes: ${d.notes}\n`;
        }
        msg += `\n🔐 Confirmation Code: ${d.confirmationCode}\n\n`;
        msg += `Please enter this 5-letter code on the website to confirm your booking.\n\n`;
        msg += `Thank you for choosing Playday Cuts! Text ${process.env.NEXT_PUBLIC_BUSINESS_PHONE} for questions.`;
        return msg;
    }

    // Template for business notification
    businessNotification(d) {
        const isAtLocation = d.location && d.location.toLowerCase().includes("at location");
        const displayAddress = isAtLocation
            ? process.env.NEXT_PUBLIC_BUSINESS_ADDRESS
            : d.address;
        const address = displayAddress || "1776 Sego Ln, Provo, UT";
        const fullDate = d.date ? `${d.day}, ${d.date}` : d.day;
        let msg = `NEW APPOINTMENT BOOKING\n\n`;
        msg += `- Customer: ${d.name}\n`;
        msg += `- Phone: ${d.phone}\n`;
        msg += `- Service: ${d.cut}\n`;
        msg += `- Date: ${fullDate}\n`;
        msg += `- Time: ${d.time}\n`;
        msg += `- Location: ${address}\n`;
        if (d.notes) {
            msg += `- Notes: ${d.notes}\n`;
        }
        msg += `\n- Booked at: ${new Date().toLocaleString()}`;
        return msg;
    }

    // Service method to send an appointment confirmation SMS to the client
    async sendAppointmentConfirmation(d) {
        const formatted = this.formatPhoneNumber(d.phone);
        const message = this.appointmentConfirmation(d);
        return await this.sendSMS(formatted, message);
    }

    // Service method to send a business notification SMS to the business
    async sendBusinessNotification(d) {
        const businessPhone = process.env.NEXT_PUBLIC_BUSINESS_PHONE;
        if (!businessPhone)
            return { success: false, error: "Business phone not configured" };
        const formatted = this.formatPhoneNumber(businessPhone);
        const message = this.businessNotification(d);
        return await this.sendSMS(formatted, message);
    }
}
const smsService = new SMSService();
export { SMSService, smsService };
export default smsService; // By John Michael
