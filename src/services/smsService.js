import axios from 'axios';

class SMSService {
    constructor() {
        this.apiKey = process.env.TEXTBELT_KEY;
        this.baseUrl = 'https://textbelt.com';
    }

    formatPhoneNumber(phone) {
        let cleaned = phone.replace(/[^\d+]/g, '');
        
        if (cleaned.startsWith('+')) {
            return cleaned;
        }
        
        if (cleaned.length === 10) {
            return `+1${cleaned}`;
        }
        
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+${cleaned}`;
        }
        
        return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    }



    async sendSMS(phone, message) {
        try {            
            const response = await axios.post(`${this.baseUrl}/text`, {
                phone: phone,
                message: message,
                key: this.apiKey
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            return {
                success: response.data.success,
                textId: response.data.textId,
                error: response.data.error
            };
        } catch (error) {
            console.error('SMS Service Error:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // SMS Templates
    appointmentConfirmation(appointmentDetails) {
        const { name, confirmationCode, cut, day, time, location, address } = appointmentDetails;
        
        let message = `Hey ${name}! Your ${cut} appointment is booked!\n\n`;
        message += `- Date: ${day} at ${time}\n`;
        
        const displayAddress = location === 'at location' ? process.env.BUSINESS_ADDRESS : address;
        message += `- Location: ${displayAddress}`;
        
        message += `\n\n🔐 Confirmation Code: ${confirmationCode}`;
        message += `\n\n**Please enter this code on the website to confirm your booking.**`;
        message += `\n\nThank you for choosing Playday Cuts! Text ${process.env.BUSINESS_PHONE} for any further questions.`;
        
        return message;
    }

    businessNotification(appointmentDetails) {
        const { name, phone, cut, day, time, location, address } = appointmentDetails;
        
        let message = `NEW APPOINTMENT BOOKING\n\n`;
        message += `- Customer: ${name}\n`;
        message += `- Phone: ${phone}\n`;
        message += `- Service: ${cut}\n`;
        message += `- Date: ${day}\n`;
        message += `- Time: ${time}\n`;
        
        const displayAddress = location === 'at location' ? process.env.BUSINESS_ADDRESS : address;
        if (displayAddress) {
            message += `- Location: ${displayAddress}`;
        }
        
        message += `\n\n- Booked at: ${new Date().toLocaleString()}`;
        
        return message;
    }

    appointmentCancellation(appointmentDetails) {
        const { name, phone, cut, day, time, location, address } = appointmentDetails;
        
        let message = `❌ APPOINTMENT CANCELLED\n\n`;
        message += `- Customer: ${name}\n`;
        message += `- Phone: ${phone}\n`;
        message += `- Service: ${cut}\n`;
        message += `- Date: ${day}\n`;
        message += `- Time: ${time}\n`;
        message += `- Location: ${location}`;
        
        const displayAddress = location === 'at location' ? process.env.BUSINESS_ADDRESS : address;
        if (displayAddress) {
            message += `\n- Address: ${displayAddress}`;
        }
        
        message += `\n\n- Cancelled at: ${new Date().toLocaleString()}`;
        
        return message;
    }

    // SMS Service Methods
    async sendAppointmentConfirmation(appointmentDetails) {
        const { phone } = appointmentDetails;
        const message = this.appointmentConfirmation(appointmentDetails);
        const formattedPhone = this.formatPhoneNumber(phone);
        return await this.sendSMS(formattedPhone, message);
    }

    async sendBusinessNotification(appointmentDetails) {
        const businessPhone = process.env.BUSINESS_PHONE;
        if (!businessPhone) {
            return {
                success: false,
                error: 'Business phone not configured'
            };
        }

        const message = this.businessNotification(appointmentDetails);
        const formattedPhone = this.formatPhoneNumber(businessPhone);
        return await this.sendSMS(formattedPhone, message);
    }

    async sendAppointmentCancellation(appointmentDetails) {
        const { phone } = appointmentDetails;
        const message = this.appointmentCancellation(appointmentDetails);
        const formattedPhone = this.formatPhoneNumber(phone);
        return await this.sendSMS(formattedPhone, message);
    }
} export default new SMSService(); // By John Michael