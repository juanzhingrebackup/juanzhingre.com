// Using Node.js built-in fetch instead of axios for Vercel compatibility

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
            console.log('=== SMS SERVICE: sendSMS called ===');
            console.log('SMS Service: Sending SMS to', phone);
            console.log('SMS Service: API Key present:', !!this.apiKey);
            console.log('SMS Service: API Key length:', this.apiKey ? this.apiKey.length : 0);
            console.log('SMS Service: API Key first 5 chars:', this.apiKey ? this.apiKey.substring(0, 5) : 'N/A');
            console.log('SMS Service: Base URL:', this.baseUrl);
            console.log('SMS Service: Message length:', message.length);
            console.log('SMS Service: Message preview:', message.substring(0, 100) + '...');
            
            const requestData = {
                phone: phone,
                message: message,
                key: this.apiKey
            };
            console.log('SMS Service: Request data:', JSON.stringify(requestData, null, 2));
            
            const requestUrl = `${this.baseUrl}/text`;
            console.log('SMS Service: Request URL:', requestUrl);
            
            // Convert data to URL-encoded format for textbelt API
            const formData = new URLSearchParams();
            formData.append('phone', requestData.phone);
            formData.append('message', requestData.message);
            formData.append('key', requestData.key);
            
            console.log('SMS Service: Form data:', formData.toString());
            
            const response = await fetch(requestUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData.toString()
            });

            console.log('SMS Service: Response status:', response.status);
            console.log('SMS Service: Response ok:', response.ok);
            console.log('SMS Service: Response headers:', Object.fromEntries(response.headers.entries()));
            
            const responseData = await response.json();
            console.log('SMS Service: Response data:', JSON.stringify(responseData, null, 2));

            return {
                success: responseData.success,
                textId: responseData.textId,
                error: responseData.error
            };
        } catch (error) {
            console.error('=== SMS SERVICE ERROR ===');
            console.error('SMS Service Error:', error.message);
            console.error('SMS Service Error name:', error.name);
            console.error('SMS Service Error code:', error.code);
            console.error('SMS Service Error stack:', error.stack);
            console.error('SMS Service Error Details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
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
        console.log('=== SMS SERVICE: sendAppointmentConfirmation called ===');
        console.log('Appointment details received:', JSON.stringify(appointmentDetails, null, 2));
        
        const { phone } = appointmentDetails;
        console.log('Phone number extracted:', phone);
        
        const message = this.appointmentConfirmation(appointmentDetails);
        console.log('Generated message:', message);
        
        const formattedPhone = this.formatPhoneNumber(phone);
        console.log('Formatted phone:', formattedPhone);
        
        console.log('About to call sendSMS with phone:', formattedPhone);
        const result = await this.sendSMS(formattedPhone, message);
        console.log('sendSMS result:', JSON.stringify(result, null, 2));
        
        return result;
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
}

const smsService = new SMSService();
export default smsService; // By John Michael