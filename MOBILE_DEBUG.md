# Mobile Debugging Guide

## Option 1: Access Dev Server on Local Network (Easiest)

1. **Start the mobile-friendly dev server:**
   ```bash
   npm run dev:mobile
   ```

2. **Find your computer's local IP address:**
   - **Mac/Linux:** Run `ifconfig | grep "inet " | grep -v 127.0.0.1` or `ipconfig getifaddr en0`
   - **Windows:** Run `ipconfig` and look for IPv4 Address
   - Usually something like `192.168.1.xxx` or `10.0.0.xxx`

3. **On your phone (same WiFi network):**
   - Open browser and go to: `http://YOUR_IP_ADDRESS:2509`
   - Example: `http://192.168.1.100:2509`

4. **View console logs:**
   - **iOS Safari:** Connect iPhone to Mac via USB, then Safari → Develop → [Your Device] → [Your Site]
   - **Android Chrome:** Connect via USB, then Chrome → `chrome://inspect` → Remote devices

---

## Option 2: Use Browser DevTools Mobile Emulation

1. **Chrome DevTools:**
   - Open Chrome DevTools (F12)
   - Click device toolbar icon (Ctrl+Shift+M / Cmd+Shift+M)
   - Select device or set custom dimensions
   - Open Console tab to see logs

2. **Firefox DevTools:**
   - Open DevTools (F12)
   - Click responsive design mode (Ctrl+Shift+M / Cmd+Shift+M)
   - Select device preset

**Note:** This simulates mobile but may not catch all mobile-specific issues.

---

## Option 3: Use Tunneling Service (Works from anywhere)

### Using ngrok (Recommended):

1. **Install ngrok:**
   ```bash
   # Mac
   brew install ngrok
   
   # Or download from https://ngrok.com/download
   ```

2. **Start your dev server:**
   ```bash
   npm run dev
   ```

3. **In another terminal, create tunnel:**
   ```bash
   ngrok http 2509
   ```

4. **Use the provided URL** (e.g., `https://abc123.ngrok.io`) on your phone
   - Works on any network (not just local WiFi)
   - HTTPS enabled automatically

### Using localtunnel (Free, no signup):

1. **Install:**
   ```bash
   npm install -g localtunnel
   ```

2. **Start tunnel:**
   ```bash
   lt --port 2509
   ```

3. **Use the provided URL** on your phone

---

## Option 4: Remote Debugging (Best for Console Access)

### iOS Safari:

1. **On iPhone:** Settings → Safari → Advanced → Web Inspector (ON)

2. **On Mac:**
   - Connect iPhone via USB
   - Open Safari on Mac
   - Safari → Preferences → Advanced → "Show Develop menu"
   - Safari → Develop → [Your iPhone] → [Your Site]
   - Console will show all errors and logs

### Android Chrome:

1. **On Android:** Settings → Developer Options → USB Debugging (ON)

2. **On Computer:**
   - Connect phone via USB
   - Open Chrome on computer
   - Go to `chrome://inspect`
   - Click "inspect" under your device
   - Full DevTools with console access

---

## Quick Console Access on Mobile

If you just need to see errors quickly, you can:

1. **Add this to your browser console on mobile:**
   - Some mobile browsers let you access console via special URLs or developer menus
   - Or use a bookmarklet to show console

2. **Use Eruda (Mobile DevTools):**
   Add this script to your `app/layout.tsx` temporarily:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
   <script>eruda.init();</script>
   ```
   This adds a floating DevTools button on mobile.

---

## Recommended Workflow

1. **For quick testing:** Use `npm run dev:mobile` + local network access
2. **For debugging:** Use remote debugging (Option 4) for full console access
3. **For sharing/testing:** Use ngrok tunnel

---

## Troubleshooting

**Can't access via local IP:**
- Make sure phone and computer are on same WiFi
- Check firewall settings (may need to allow port 2509)
- Try disabling VPN on either device

**Console not showing:**
- Make sure you're using remote debugging (Option 4) for best results
- Or use Eruda script for on-device console

