export default function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const apiKey = process.env.GOOGLE_MAPS_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'Google Maps API key not configured' });
    }

    // Return the API key to the client
    res.status(200).json({ apiKey });
} // By John Michael