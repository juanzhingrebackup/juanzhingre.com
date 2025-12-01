import { neon } from "@neondatabase/serverless";

class DatabaseService {
    constructor() {
        this.sql = null;
    }

    // Helper method to get the SQL client
    getSql() {
        if (!this.sql) {
            if (!process.env.DATABASE_URL) {
                throw new Error("DATABASE_URL environment variable is not set");
            }
            this.sql = neon(process.env.DATABASE_URL);
        }
        return this.sql;
    }

    // Async method to initialize the database
    async init() {
        try {
            // Create appointments table if it doesn't exist
            await this.getSql()`
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
                    notes TEXT,
                    confirmation_code VARCHAR(4) NOT NULL,
                    status VARCHAR(20) DEFAULT 'confirmed',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Create indexes for better query performance
            await this.getSql()`
                CREATE INDEX IF NOT EXISTS idx_appointments_date_time 
                ON appointments(date, time)
            `;

            await this.getSql()`
                CREATE INDEX IF NOT EXISTS idx_appointments_status 
                ON appointments(status)
            `;

            await this.getSql()`
                CREATE INDEX IF NOT EXISTS idx_appointments_confirmation_code 
                ON appointments(confirmation_code)
            `;
        } catch (error) {
            console.error("Database initialization error:", error);
            throw error;
        }
    }

    // Async method to create a new appointment
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
            notes,
            confirmationCode
        } = appointmentData;

        try {
            const result = await this.getSql()`
                INSERT INTO appointments (
                    name, phone, cut, day, date, time, location, address, notes, confirmation_code
                ) VALUES (
                    ${name}, ${phone}, ${cut}, ${day}, ${date}, ${time}, ${location}, ${address || null}, ${notes || null}, ${confirmationCode}
                )
                RETURNING id, created_at
            `;

            return {
                success: true,
                appointment: result[0]
            };
        } catch (error) {
            console.error("Error creating appointment:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Async method to get all appointments
    async getAppointments() {
        try {
            const result = await this.getSql()`
                SELECT * FROM appointments 
                ORDER BY created_at DESC
            `;
            return {
                success: true,
                appointments: result
            };
        } catch (error) {
            console.error("Error fetching appointments:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Async method to get appointments by date and time
    async getAppointmentsByDateTime(date, time) {
        try {
            const result = await this.getSql()`
                SELECT * FROM appointments 
                WHERE date = ${date} 
                AND time = ${time} 
                AND status != 'cancelled'
            `;
            return {
                success: true,
                appointments: result
            };
        } catch (error) {
            console.error("Error fetching appointments by date/time:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Async method to get an appointment by confirmation code
    async getAppointmentByConfirmationCode(code) {
        try {
            const result = await this.getSql()`
                SELECT * FROM appointments 
                WHERE confirmation_code = ${code}
                AND created_at > NOW() - INTERVAL '24 hours'
            `;
            return {
                success: true,
                appointment: result[0] || null
            };
        } catch (error) {
            console.error("Error fetching appointment by code:", error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}
export default new DatabaseService(); // By John Michael
