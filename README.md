# juanzhingre.com 1.2.0

Portfolio website for [Juan Zhingre](https://juanzhingre.com)

Director: By John Michael

Producer: Juan Zhingre

## Setup and Development

1. Clone
    ```bash
    git clone https://github.com/byjohnmichael/juanzhingre.com.git
    ```

2. Navigate
    ```bash
    cd juanzhingre.com
    ```

3. Copy `env.example` to `.env.local`:
    ```bash
    cp env.example .env.local
    ```

4. Fill in the required environment variables in `.env.local`:
   - `TEXTBELT_KEY` - SMS API key from textbelt.com
   - `DATABASE_URL` - PostgreSQL database connection string
   - `GOOGLE_MAPS_KEY` - Google Maps API key
   - `NEXT_PUBLIC_BUSINESS_PHONE` - Business phone for direct communication
   - `NEXT_PUBLIC_BUSINESS_ADDRESS` - Your business address, sent once the client confirms
   - `NEXT_PUBLIC_SERVICE_AREA` - Service area, Google Maps will use this to calculate distances

5. Installation
    ```bash
    npm install
    ```
6. Develop
    ```bash
    npm run dev
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
