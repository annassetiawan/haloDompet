# 📱 Quick Start: Test di iPhone dalam 5 Menit

## 🎯 Goal
Test voice recording di iPhone 15 Safari menggunakan ngrok tunnel.

---

## ⚡ Step-by-Step

### 1️⃣ Install Ngrok (One-time)

```bash
./setup-ngrok.sh
```

Script ini akan install ngrok otomatis.

### 2️⃣ Setup Auth Token (One-time)

1. **Sign up** gratis di https://ngrok.com
2. **Copy auth token** dari https://dashboard.ngrok.com/get-started/your-authtoken
3. **Authenticate:**
   ```bash
   ngrok authtoken PASTE_YOUR_TOKEN_HERE
   ```

### 3️⃣ Start Server + Ngrok

```bash
npm run dev:ngrok
```

Output akan seperti ini:
```
🚀 Starting dev server and ngrok...

Session Status    online
Account          your-email@gmail.com
Forwarding       https://1234-abcd-efgh.ngrok-free.app -> http://localhost:3000

ngrok Web UI     http://localhost:4040
```

### 4️⃣ Buka di iPhone

1. **Copy URL** yang ada "Forwarding" (misal: `https://1234-abcd.ngrok-free.app`)
2. **Buka Safari** di iPhone
3. **Paste URL** dan enter
4. **Login** dengan Google
5. **Test voice recording:**
   - Klik tombol mic (lingkaran besar)
   - Allow microphone permission
   - Bicara: "beli nasi goreng 15 ribu"
   - Stop recording
   - Lihat hasilnya!

---

## 🐛 Debug (Kalau Gagal)

### Check Console Logs di iPhone:

1. Di Mac, buka **Safari → Develop → iPhone (nama kamu) → [URL ngrok]**
2. Akan buka Web Inspector
3. Tab **Console** - lihat logs
4. Should see: `🍎 iOS device detected, using RecordRTC recorder`

### Expected Logs (Success):
```
🍎 iOS device detected, using RecordRTC recorder
🎤 [iOS] Starting recording with RecordRTC...
✅ [iOS] Microphone permission granted
✅ [iOS] RecordRTC recording started
⏹️ [iOS] Stopping recording...
📦 [iOS] Final audio blob: 52431 bytes, type: audio/wav
✅ [iOS] STT API response: { success: true, text: "beli nasi goreng 15 ribu" }
```

### Common Issues:

**1. "ngrok: command not found"**
```bash
./setup-ngrok.sh  # Run setup script
```

**2. "authtoken" error**
```bash
ngrok authtoken YOUR_TOKEN_HERE  # Get token from dashboard
```

**3. Microphone permission denied**
- iPhone Settings → Safari → Microphone → Allow

**4. No audio captured (0 bytes)**
- Check if HTTPS (ngrok provides this automatically)
- Hard refresh: Cmd+Shift+R
- Try speaking louder

**5. "This site has been flagged" (ngrok warning)**
- Klik "Visit Site" - aman, ini local dev server kamu

---

## 💡 Tips

- ✅ **Keep terminal open** - Ngrok tunnel aktif selama terminal jalan
- ✅ **Use Web UI** - `http://localhost:4040` untuk lihat semua requests
- ✅ **New URL setiap restart** - Free tier dapat random URL
- ✅ **Share screen** - Bisa share URL ke teman untuk testing
- ⚠️ **Don't commit .ngrok** files - Already in .gitignore

---

## 🎤 Test Scenarios

### Scenario 1: Simple Expense
**Say:** "beli nasi goreng 15 ribu"
**Expected:** Creates transaction: "Nasi Goreng" - Rp 15,000

### Scenario 2: Complex Expense
**Say:** "bayar internet indihome 350 ribu setiap tanggal 10"
**Expected:** Creates transaction: "Internet Indihome" - Rp 350,000

### Scenario 3: With Category Hint
**Say:** "beli buku pemrograman 120 ribu untuk edukasi"
**Expected:** Category: "Edukasi", Amount: Rp 120,000

---

## 📊 Success Indicators

✅ Toast: "🎤 Merekam... Bicara sekarang!"
✅ Toast: "Terdeteksi: [your text]"
✅ Transaction appears in dashboard
✅ Balance updated correctly
✅ Console shows WAV file upload success

---

## 🆘 Still Not Working?

1. **Check console logs** (Safari Develop menu)
2. **Screenshot errors** and share
3. **Try different phrases** - maybe AI transcription issue
4. **Test on desktop first** - verify app works on Chrome
5. **Check Gemini API key** - might be quota issue

---

Happy testing! 📱✅
