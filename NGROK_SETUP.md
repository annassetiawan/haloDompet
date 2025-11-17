# HaloDompet - Ngrok Setup untuk Testing di iPhone

## 📱 Kenapa Ngrok?

Ngrok akan expose local dev server (`http://localhost:3000`) ke internet dengan HTTPS, jadi kamu bisa:
- ✅ Test di iPhone langsung tanpa deploy
- ✅ HTTPS otomatis (required untuk microphone access)
- ✅ Faster iteration (no deploy waiting time)

---

## 🔧 Setup Ngrok

### 1. Install Ngrok

**Option A: Download Binary (Recommended)**
```bash
# Download ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok
```

**Option B: Using npm**
```bash
npm install -g ngrok
```

**Option C: Download manually**
1. Go to https://ngrok.com/download
2. Download for your OS
3. Unzip dan move ke PATH

### 2. Signup & Get Auth Token

1. **Signup** di https://ngrok.com (gratis)
2. **Copy auth token** dari dashboard
3. **Authenticate** ngrok:
   ```bash
   ngrok authtoken YOUR_TOKEN_HERE
   ```

---

## 🚀 Usage

### Quick Start (Automatic)

Kami sudah sediakan npm script. Jalankan:

```bash
npm run dev:ngrok
```

Ini akan:
1. ✅ Start Next.js dev server di port 3000
2. ✅ Start ngrok tunnel
3. ✅ Expose ke public URL dengan HTTPS

### Manual (2 Terminal)

**Terminal 1 - Dev Server:**
```bash
npm run dev
```

**Terminal 2 - Ngrok:**
```bash
ngrok http 3000
```

---

## 📱 Test di iPhone

1. **Run dev server** dengan ngrok:
   ```bash
   npm run dev:ngrok
   ```

2. **Copy URL** dari ngrok output:
   ```
   Forwarding  https://xxxx-xxx-xxx-xxx.ngrok-free.app -> http://localhost:3000
   ```

3. **Buka URL** di Safari iPhone (misal: `https://1234-abcd.ngrok-free.app`)

4. **Test voice recording**:
   - Klik tombol mic
   - Grant permission
   - Bicara: "beli nasi goreng 15 ribu"
   - Check console logs (Safari → Develop → iPhone → Inspect)

---

## 🐛 Troubleshooting

### Issue: "ngrok: command not found"
**Solution:** Install ngrok dulu (lihat step 1 di atas)

### Issue: "authtoken" error
**Solution:**
```bash
ngrok authtoken YOUR_TOKEN_HERE
```
Get token dari https://dashboard.ngrok.com/get-started/your-authtoken

### Issue: Ngrok free tier limit
**Solution:** Ngrok free tier allows:
- ✅ 1 ngrok process
- ✅ HTTPS tunnels
- ❌ Custom domains (paid)
- ❌ Multiple tunnels simultaneously (paid)

Cukup untuk testing!

### Issue: iPhone mic tidak work
**Debug steps:**
1. Check console logs di Safari Dev Tools
2. Pastikan HTTPS (bukan HTTP)
3. Allow microphone permission di Settings → Safari
4. Hard refresh (Cmd+Shift+R)

---

## 🎯 Quick Commands

```bash
# Start dev + ngrok
npm run dev:ngrok

# Start dev only
npm run dev

# Start ngrok only (dev server must be running)
ngrok http 3000

# Check ngrok status
curl http://localhost:4040/api/tunnels
```

---

## 📊 Ngrok Web Interface

Ngrok provides web interface at `http://localhost:4040`

Features:
- ✅ See all requests
- ✅ Inspect request/response
- ✅ Replay requests
- ✅ Status and metrics

---

## 🔒 Security Notes

- ⚠️ URL publik dan bisa diakses siapa saja
- ⚠️ Jangan share URL ngrok ke orang lain (bisa access local env)
- ⚠️ URL berubah setiap restart (kecuali paid plan)
- ✅ Aman untuk testing pribadi
- ✅ Auto HTTPS encryption

---

## 💡 Tips

1. **Keep ngrok running** - Jangan close terminal
2. **Copy URL** - Save URL ngrok untuk access dari iPhone
3. **Use Web Interface** - `http://localhost:4040` untuk debugging
4. **Free tier enough** - No need paid plan untuk testing
5. **Stable connection** - Pastikan WiFi stabil

---

Happy testing! 🚀📱
