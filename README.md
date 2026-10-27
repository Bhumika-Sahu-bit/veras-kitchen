# Vera's Kitchen — Vite + React + Tailwind + Sanity

## Run karne ke steps
1. `npm install`
2. `cp .env.example .env`  (Sanity project ID baad me bharna; bina ID ke mock data chalega)
3. `npm run dev`  -> http://localhost:5173
4. `npm run build` -> production build `dist/` me

## Sanity connect karna
- Sanity Studio me `sanity-schemas/menuItem.js` aur `galleryImage.js` add karo.
- Studio ke schema index me dono ko register karo.
- Sanity dashboard -> API -> CORS origins me `http://localhost:5173` aur apna live domain add karo.
- `.env` me `VITE_SANITY_PROJECT_ID` set karo.

## Launch se pehle `src/App.jsx` me badlo
- `WHATSAPP_NUMBER` (e.g. 919876543210) aur `PHONE_DISPLAY`
- Opening hours (Contact section)
- `MAP_SRC` (Google Maps -> Share -> Embed a map)
