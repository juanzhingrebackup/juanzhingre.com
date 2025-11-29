# juanzhingre.com

Portfolio website for [Juan Zhingre](https://juanzhingre.com)

Directed and creative decisions made [By John Michael](https://byjohnmichael.com)

Produced and creative decisions approved by [Juan Zhingre](https://juanzhingre.com)

## Environment Setup

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Fill in the required environment variables in `.env.local`:
   - `DATABASE_URL` - Neon/PostgreSQL database connection string
   - `TEXTBELT_KEY` - SMS API key from textbelt.com
   - `GOOGLE_MAPS_KEY` - Google Maps API key (with restrictions enabled)
   - `NEXT_PUBLIC_BUSINESS_PHONE` - Your business phone number
   - `NEXT_PUBLIC_BUSINESS_ADDRESS` - Your business address
   - `NEXT_PUBLIC_SERVICE_AREA` - Your service area (e.g., "Provo, UT")

3. **IMPORTANT**: Secure your Google Maps API key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to APIs & Services > Credentials
   - Edit your API key and add restrictions:
     - Application restrictions: HTTP referrers (websites)
     - Add your domain(s) (e.g., `https://yourdomain.com/*`)
     - API restrictions: Select only these APIs:
       - Places API
       - Distance Matrix API
       - Maps JavaScript API

## Getting Started Guide

1. Clone
    ```bash
    git clone https://github.com/byjohnmichael/juanzhingre.com.git
    ```
2. Navigate
    ```bash
    cd juanzhingre.com
    ```
3. Installation
    ```bash
    npm install
    ```
4. Develop
    ```bash
    npm run dev
    ```
5. Lint
    ```bash
    npm run lint
    ```
6. Format
    ```bash
    npm run format:check
    npm run format
    ```
7. Build
    ```bash
    npm run build
    ```
8. Start
    ```bash
    npm run start
    ```

---

[By John Michael](https://byjohnmichael.com)
