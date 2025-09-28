import { neon } from '@neondatabase/serverless';

class DatabaseService {
    constructor() {
        this.sql = neon(process.env.DATABASE_URL);
    }

    async init() {
        try {
            // Create appointments table if it doesn't exist
            await this.sql`
                CREATE TABLE IF NOT EXISTS appointments (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    phone VARCHAR(20) NOT NULL,
                    cut VARCHAR(50) NOT NULL,
                    day VARCHAR(20) NOT NULL,
                    date VARCHAR(20) NOT NULL,
                    time VARCHAR(20) NOT NULL,
                    location VARCHAR(200) NOT NULL,
                    address TEXT,
                    confirmation_code VARCHAR(4) NOT NULL,
                    status VARCHAR(20) DEFAULT 'confirmed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
        } catch (error) {
            console.error('Database initialization error:', error);
            throw error;
        }
    }

    async createAppointment(appointmentData) {
        const {
            name,
            phone,
            cut,
            day,
            date,
            time,
            location,
            address,
            confirmationCode
        } = appointmentData;

        try {
            const result = await this.sql`
                INSERT INTO appointments (
                    name, phone, cut, day, date, time, location, address, confirmation_code
                ) VALUES (
                    ${name}, ${phone}, ${cut}, ${day}, ${date}, ${time}, ${location}, ${address || null}, ${confirmationCode}
                )
                RETURNING id, created_at
            `;

            return {
                success: true,
                appointment: result[0]
            };
        } catch (error) {
            console.error('Error creating appointment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAppointments() {
        try {
            const result = await this.sql`
                SELECT * FROM appointments 
                ORDER BY created_at DESC
            `;
            return {
                success: true,
                appointments: result
            };
        } catch (error) {
            console.error('Error fetching appointments:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteOldAppointments() {
        try {
            const result = await this.sql`
                DELETE FROM appointments 
                WHERE created_at < NOW() - INTERVAL '7 days'
            `;
            
            return {
                success: true,
                deletedCount: result.length
            };
        } catch (error) {
            console.error('Error deleting old appointments:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAppointmentById(id) {
        try {
            const result = await this.sql`
                SELECT * FROM appointments WHERE id = ${id}
            `;
            return {
                success: true,
                appointment: result[0]
            };
        } catch (error) {
            console.error('Error fetching appointment:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
} export default new DatabaseService();