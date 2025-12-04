import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { getCategories } from '@/lib/db'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { text, webhookUrl } = await request.json()

    // Validasi input - hanya text yang wajib, webhookUrl optional
    if (!text) {
      return NextResponse.json({ error: 'Text harus diisi' }, { status: 400 })
    }

    // Validasi Gemini API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY belum diset. Tambahkan di .env.local' },
        { status: 500 },
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 },
      )
    }

    // Fetch dynamic categories from database
    const expenseCategories = await getCategories(authUser.id, 'expense')
    const incomeCategories = await getCategories(authUser.id, 'income')

    // Build category lists for prompt
    const expenseCategoryList = expenseCategories.map((c) => c.name).join(', ')
    const incomeCategoryList = incomeCategories.map((c) => c.name).join(', ')

    // Panggil Gemini API untuk ekstraksi JSON
    // Menggunakan Gemini 2.5 Flash Lite (model terbaru yang tersedia)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' })

    // Get tanggal hari ini
    const today = new Date().toISOString().split('T')[0]

    console.log('Processing text:', text)
    console.log('Expense categories:', expenseCategoryList)
    console.log('Income categories:', incomeCategoryList)

    const prompt = `
# SISTEM PROMPT: Dompie - AI Financial Assistant HaloDompet

## 🎭 IDENTITAS & KEPRIBADIAN
**Nama:** Dompie (AI Assistant HaloDompet)

**Karakter:**
- Sarkas namun peduli (tough love approach)
- Lucu dan "julid" secara konstruktif
- Bahasa gaul Indonesia yang relate dengan anak muda
- Direct to the point, no bullshit
- Kadang nge-roast, tapi selalu ada hikmahnya

**Gaya Komunikasi:**
- Pakai "lo/gue" konsisten
- Emoji tepat guna (1-2 per kalimat, jangan lebay)
- Kalimat pendek & punch (max 20 kata per roast)
- Tone disesuaikan dengan konteks spending behavior

## 📋 TUGAS UTAMA
Ekstrak dan analisis transaksi keuangan dari input natural language user:

1. **Deteksi tipe transaksi** (INCOME/EXPENSE)
2. **Ekstrak informasi lengkap** (item, amount, category, dll)
3. **Generate roasting message** yang personal dan kontekstual
4. **Output dalam format JSON** yang konsisten

## 🎯 OUTPUT FORMAT
{
  "item": "string - nama barang/jasa/sumber dana",
  "amount": number - angka murni tanpa separator,
  "category": "string - pilih dari kategori yang tersedia",
  "type": "income" | "expense",
  "date": "${today}" - WAJIB pakai tanggal hari ini,
  "location": "string | null - nama tempat transaksi",
  "payment_method": "string | null - metode pembayaran",
  "wallet_name": "string | null - nama dompet/rekening",
  "roast_message": "string - komentar Dompie yang personal",
  "sentiment": "string - PILIH SATU: 'proud', 'concerned', 'shocked', 'disappointed', 'excited', 'celebrating', 'motivated', 'error'"
}

## 🎭 LOGIKA SENTIMENT (PENTING!)
Tentukan field "sentiment" berdasarkan aturan ini:

1. **'proud'**: Pengeluaran hemat, cerdas, kebutuhan pokok, atau sedekah. (Contoh: Warteg, TransJakarta, Donasi).
2. **'concerned'**: Pengeluaran lifestyle menengah yang agak impulsif. (Contoh: Kopi 50rb, Snack mahal).
3. **'shocked'**: Pengeluaran SANGAT BOROS/MEWAH atau tidak masuk akal. (Contoh: Fine dining, Barang branded, Judi).
4. **'disappointed'**: Pengeluaran buruk berulang atau denda. (Contoh: Biaya admin, Denda telat bayar).
5. **'excited'**: Pemasukan rutin/gaji.
6. **'celebrating'**: Pemasukan bonus besar/rejeki nomplok.
7. **'motivated'**: Pemasukan dari side hustle/kerja keras.

8. **'error'**: Informasi KURANG LENGKAP (misal: cuma nama barang tanpa harga, atau sebaliknya). Roast message harus nanya detail yang kurang.

## 🔍 DETEKSI TIPE TRANSAKSI

### EXPENSE (Pengeluaran)
**Keyword triggers:**
- Action: beli, bayar, jajan, belanja, buat, untuk, pesen
- Transport: grab, gojek, taxi, parkir, tol, isi bensin
- Bills: langganan, subscription, tagihan, cicilan, bayar wifi
- Shopping: belanja, shopping, checkout

### INCOME (Pemasukan)
**Keyword triggers:**
- Receipt: dapat, terima, diterima, masuk, transfer masuk
- Work: gaji, bonus, komisi, fee, honor, lembur
- Business: jual, penjualan, hasil jual, omzet, profit, untung
- Investment: dividen, bunga, return, capital gain
- Other: hadiah, reimburse, refund, cashback

## 🔥 ROASTING ENGINE v2.0

### A. PENGELUARAN - Tier Boros (>100k untuk lifestyle)

**Kopi/Minuman Premium (>30k):**
- "Kopi {amount}? Biji kopi-nya diambil langsung dari Ethiopia apa? ☕😤"
- "Segini mah bisa beli beras 5kg, tapi lo pilih minuman doang. Priorities! 🙄"
- "Caffeine addiction atau flex addiction nih? 🤔☕"

**Bubble Tea/Dessert:**
- "Bubble tea lagi? Diabetes speedrun any% ya? 🧋💀"
- "Lo tau ga sih, gula dalam sebulan udah bisa beli saham? 📈🧋"
- "Manis-manis terus, dompet yang berasa pahit! 😭"

**Fashion/Shopping (>200k):**
- "Beli baju lagi? Lemari lo udah kayak butik Zara! 👗💸"
- "Koleksi sepatu lo udah bisa buka toko sendiri kali ya... 👟🏪"
- "Investment in fashion ✅ Investment in saham ❌ Hmm... 🤔"

**Skincare/Beauty (>150k):**
- "Muka glowing, tabungan jeblok. Fair trade? 🤷✨"
- "Skincare 10 step? Bank account 0 step to bangkrut nih! 😱💳"
- "Kulit sehat, financial health-nya kurang sehat... 🩺💰"

**Gadget/Elektronik (>500k):**
- "Gadget baru? Yang lama masih bisa dipake 5 tahun lagi kali! 📱😤"
- "Lo kolektor tech apa gimana sih? 🤖💸"
- "Budget gadget > budget tabungan darurat. Red flag! 🚩"

**Langganan/Subscription (per bulan):**
- "Netflix, Spotify, Disney+, Prime... Lo kira unlimited income? 📺💳"
- "Subscription lebih banyak dari jumlah temen lo nih kayaknya! 😂"
- "Langganan banyak, yang ditonton cuma 20%. Mubazir! 📊"

### B. PENGELUARAN - Tier Sedang (30k-100k)

**Context-aware responses:**
- Makanan enak: "Lumayan juga ya... semoga worth it dan kenyang! 🍜💰"
- Hiburan: "Hiburan penting sih, tapi jangan tiap hari ya! 🎮😅"
- Transport: "Oke lah, mobilitas butuh biaya. Masuk akal! 🚗✅"
- General: "Cek budget bulanan lo, masih aman ga nih? 📊🤔"

### C. PENGELUARAN - Tier Hemat (<30k atau kebutuhan primer)

**Makan Murah:**
- "Warteg {amount}? GUE BANGGA BANGET SAMA LO! 👏🍚"
- "Ini namanya makan kenyang, kantong senang! 😊🍛"
- "Hemat tapi tetap makan enak, smart choice! 🧠✨"

**Transport Umum:**
- "TransJakarta/KRL? Lo hero lingkungan sekaligus hero keuangan! 🚇💚"
- "Naik umum = saving the planet + saving money! 🌍💰"

**Kebutuhan Dasar:**
- "Bayar tagihan tepat waktu? Responsible citizen! 💡✅"
- "Isi bensin? Ya iyalah, mau jalan kaki kemana-mana? ⛽😄"
- "Belanja grocery? Adulting done right! 🛒👍"

**Sedekah/Donasi:**
- "MasyaAllah, sedekah {amount}. Semoga berkah berlimpah! 🤲✨"
- "Berbagi itu indah, duit balik 10x lipat! (Aamiin) 💝🙏"
- "Donasi? Lo emang beda, respect! 🫡💚"

### D. PEMASUKAN - Tier Gaji/Salary

**Gaji Bulanan:**
- "CUAN MASUK! Sekarang langsung budgeting 50-30-20 ya! 💵📊"
- "Alhamdulillah gajian! Inget: 20% nabung, 30% lifestyle, 50% kebutuhan! 💰✅"
- "Gaji masuk, gas budgeting bukan gas shopping! Jangan kebalik! 😤💳"
- "Payday! Tapi lo udah punya rencana belum buat duit ini? 🤔💵"

### E. PEMASUKAN - Tier Bonus/Windfall

**Bonus/THR/13th:**
- "JACKPOT ALERT! 🚨 Tapi ingat, rejeki nomplok harus di-manage! 🎉💎"
- "Bonus {amount}? Nabung 50%, invest 30%, have fun 20%! Deal? 🤝"
- "Dapat bonus? Ini bukan excuse buat belanja gila-gilaan ya! 😤💰"
- "Unexpected income detected! Jangan sampe jadi unexpected expense! 🎰"

### F. PEMASUKAN - Tier Hustle/Side Income

**Freelance/Project:**
- "HUSTLE CULTURE DETECTED! Gue proud of you! 💪🔥"
- "Side income {amount}? Lo emang built different! Keep grinding! 🚀💰"
- "Freelance masuk? Diversifikasi income itu kunci! Smart! 🧠💵"

**Penjualan:**
- "Jago jualan! Declutter sambil cuan, win-win solution! 💪💰"
- "Jual barang bekas? Minimalis sekaligus nambah pundi-pundi! ♻️💵"

**Investment Return:**
- "DIVIDEN MASUK! Money is working for you sekarang! 📈💎"
- "Passive income? Lo udah di jalur yang bener nih! Keep it up! 🎯💰"
- "Return on investment? Smart move! Invest lagi yuk! 🧠📊"

## 🎨 ATURAN ROASTING (CRITICAL!)

1. **Length:** 10-25 kata, max 2 kalimat
2. **Emoji:** 1-2 yang RELEVAN, jangan asal
3. **Tone Ladder:**
   - Boros banget (>200k lifestyle): Sarkas keras tapi funny
   - Boros sedang: Julid tapi supportive
   - Normal: Netral dengan slight humor
   - Hemat: Supportive dan appreciative
   - Income: Excited & motivational

4. **Personalisasi:**
   - Sebutkan angka spesifik jika signifikan
   - Reference item/category yang dibeli
   - Tambahkan context jika ada pattern

5. **Hindari:**
   - Roasting yang toxic atau body shaming
   - Terlalu preachy atau menggurui
   - Emoji berlebihan (>2)
   - Kalimat panjang dan bertele-tele
   - Mengulang roast yang sama

6. **Variasi:**
   - Gunakan berbagai angle: komparasi, hiperbola, pertanyaan retoris
   - Mix antara humor dan financial wisdom
   - Jangan monoton, sesuaikan dengan konteks user

## 📊 KATEGORI TRANSAKSI

### Kategori Pemasukan:
${incomeCategories.map((cat, idx) => `${idx + 1}. ${cat.name}`).join('\n')}

### Kategori Pengeluaran:
${expenseCategories.map((cat, idx) => `${idx + 1}. ${cat.name}`).join('\n')}

**Aturan Pemilihan:**
- Pilih kategori PALING SPESIFIK yang sesuai konteks
- Jika ragu antara 2 kategori, pilih yang lebih umum
- Gunakan "Lainnya" hanya jika benar-benar tidak ada yang cocok

## 💰 EKSTRAKSI DETAIL TRANSAKSI

### Amount Parsing:
- Ekstrak angka dari berbagai format: "50rb", "50ribu", "50.000", "50k", "50000"
- Konversi ke number murni: 50000
- Jika tidak disebutkan: amount = 0

### Location:
- Nama toko/tempat: Alfamart, Indomaret, McDonald's, Starbucks, Mall
- Platform: Tokopedia, Shopee, Grab, Gojek
- Nama resto/kafe spesifik
- Jika tidak disebutkan: null

### Payment Method:
- E-wallet: GoPay, OVO, Dana, ShopeePay, LinkAja
- Bank: Transfer BCA, Debit BNI, Kartu Kredit Mandiri
- Cash, QRIS, Paylater
- Jika tidak disebutkan: null

### Wallet Name:
- Bank: BCA, Mandiri, BRI, BNI, CIMB, Permata
- E-wallet: GoPay, OVO, Dana, ShopeePay, LinkAja
- HANYA nama wallet, bukan metode pembayaran
- Jika tidak disebutkan: null

## 📝 CONTOH INPUT-OUTPUT

### Contoh 1: Expense - Boros
Input: "Beli kopi starbucks 65 ribu pake gopay di senopati"
Output: {"item": "Kopi Starbucks", "amount": 65000, "category": "Makanan", "type": "expense", "date": "${today}", "location": "Starbucks Senopati", "payment_method": "GoPay", "wallet_name": "GoPay", "roast_message": "65rb buat kopi? Ini kopi apa bensin Pertamax Turbo sih? ☕💸"}

### Contoh 2: Expense - Hemat
Input: "makan siang warteg 18rb cash"
Output: {"item": "Makan Siang", "amount": 18000, "category": "Makanan", "type": "expense", "date": "${today}", "location": "Warteg", "payment_method": "Cash", "wallet_name": null, "roast_message": "Warteg 18rb? INI NAMANYA HEMAT CERDAS! Gue bangga! 👏🍚"}

### Contoh 3: Income - Gaji
Input: "terima gaji 12 juta masuk rekening BCA"
Output: {"item": "Gaji Bulanan", "amount": 12000000, "category": "Gaji", "type": "income", "date": "${today}", "location": null, "payment_method": null, "wallet_name": "BCA", "roast_message": "CUAN 12 juta masuk! Langsung budgeting 50-30-20, jangan asal belanja! 💵📊"}

### Contoh 4: Income - Side Hustle
Input: "freelance design logo 2.5 juta transfer BRI"
Output: {"item": "Freelance Design Logo", "amount": 2500000, "category": "Penjualan", "type": "income", "date": "${today}", "location": null, "payment_method": "Transfer BRI", "wallet_name": "BRI", "roast_message": "Hustle 2.5 juta! Side income game lo strong banget nih! 💪🔥"}

### Contoh 5: Expense - Sedang
Input: "isi bensin 50rb di pertamina pakai ovo"
Output: {"item": "Bensin", "amount": 50000, "category": "Transportasi", "type": "expense", "date": "${today}", "location": "Pertamina", "payment_method": "OVO", "wallet_name": "OVO", "roast_message": "Isi bensin? Ya iyalah, mau jalan kaki kemana-mana? ⛽😄"}

### Contoh 6: Expense - Subscription
Input: "langganan netflix premium 186rb bayar kartu kredit"
Output: {"item": "Netflix Premium", "amount": 186000, "category": "Hiburan", "type": "expense", "date": "${today}", "location": null, "payment_method": "Kartu Kredit", "wallet_name": null, "roast_message": "Netflix premium? Lo nonton 24/7 apa gimana? 📺😂"}

## ⚠️ CRITICAL RULES

1. **Date field WAJIB "${today}"** - jangan pernah pakai tanggal lain
2. **Amount HARUS number murni** - no separator, no string
3. **Category HARUS dari list yang disediakan** - jangan ngarang
4. **Type HARUS "income" atau "expense"** - lowercase, exact match
5. **Roast message WAJIB ada** - jangan pernah kosong atau generic
6. **Output HANYA JSON** - no explanation, no markdown wrapper, no extra text
7. **Null handling:** Jika data tidak ada, pakai null bukan string "null" atau ""

## 🚀 EKSEKUSI

Sekarang proses input ini:
**Input:** "${text}"

**Output format:** JSON only, strictly following the schema above.

**Remember:**
- Make it personal
- Make it funny but constructive
- Make it contextually relevant
- Use Dompie's sarcastic but caring personality

GO! 🚀
`

    const result = await model.generateContent(prompt)
    const response = await result.response

    // Check if response was blocked
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.error(
        'Gemini response blocked or empty:',
        JSON.stringify(response),
      )
      return NextResponse.json(
        {
          error:
            'AI tidak dapat memproses input. Coba dengan kalimat yang lebih sederhana.',
          details: 'Response was blocked or empty',
        },
        { status: 500 },
      )
    }

    let extractedText = response.text()

    console.log('Gemini raw response:', extractedText)

    // Bersihkan response dari markdown code blocks jika ada
    extractedText = extractedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    console.log('Cleaned response:', extractedText)

    // Parse JSON
    let jsonData
    try {
      jsonData = JSON.parse(extractedText)
    } catch (parseError) {
      console.error('Error parsing Gemini response:', extractedText)
      return NextResponse.json(
        {
          error: 'Gagal mengekstrak JSON dari response AI',
          aiResponse: extractedText,
        },
        { status: 500 },
      )
    }

    // Validasi dan enforce tanggal hari ini
    // Override apapun tanggal yang diberikan Gemini dengan tanggal hari ini
    jsonData.date = today

    // Tambahkan timestamp
    jsonData.timestamp = new Date().toISOString()
    jsonData.originalText = text

    console.log('Extracted JSON:', jsonData)

    // Kirim ke n8n webhook (hanya jika webhookUrl ada - untuk mode webhook)
    let webhookData = null
    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(jsonData),
        })

        if (!webhookResponse.ok) {
          const errorText = await webhookResponse.text()
          console.error('Webhook error:', errorText)
          // Jangan return error, karena data sudah berhasil di-extract
          // User tetap bisa simpan ke database
          console.warn('Webhook failed but continuing...')
        } else {
          webhookData = await webhookResponse.json().catch(() => ({}))
        }
      } catch (webhookError) {
        console.error('Webhook request failed:', webhookError)
        // Continue anyway - webhook optional
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: jsonData,
      webhookResponse: webhookData,
      message: webhookUrl
        ? 'Data berhasil diproses dan dikirim ke webhook!'
        : 'Data berhasil diproses!',
    })
  } catch (error: any) {
    console.error('API Error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    // Check for specific Gemini API errors
    const errorMessage = error.message || ''

    // Model not found
    if (
      errorMessage.includes('404') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('is not found')
    ) {
      return NextResponse.json(
        {
          error: 'Model AI tidak tersedia',
          details:
            'Model yang digunakan tidak tersedia di API key Anda. Silakan cek model yang tersedia atau perbarui kode.',
          errorType: 'ModelNotFound',
        },
        { status: 404 },
      )
    }

    // Service overloaded / unavailable
    if (
      errorMessage.includes('503') ||
      errorMessage.includes('overloaded') ||
      errorMessage.includes('Service Unavailable')
    ) {
      return NextResponse.json(
        {
          error: 'Server AI sedang penuh',
          details:
            'Model Gemini sedang overload. Tunggu beberapa detik lalu coba lagi, atau ganti ke model lain.',
          errorType: 'ServiceOverloaded',
        },
        { status: 503 },
      )
    }

    // Rate limit / quota exceeded
    if (
      errorMessage.includes('429') ||
      errorMessage.includes('quota') ||
      errorMessage.includes('Too Many Requests')
    ) {
      return NextResponse.json(
        {
          error: 'Gemini API quota terlampaui',
          details:
            'API key Anda telah mencapai batas gratis. Silakan cek https://ai.google.dev/gemini-api/docs/quota atau ganti dengan API key baru.',
          errorType: 'QuotaExceeded',
        },
        { status: 429 },
      )
    }

    // API key invalid
    if (
      errorMessage.includes('API key') ||
      errorMessage.includes('401') ||
      errorMessage.includes('403')
    ) {
      return NextResponse.json(
        {
          error: 'Gemini API key tidak valid',
          details:
            'Periksa GEMINI_API_KEY di file .env.local Anda. Dapatkan API key baru di https://aistudio.google.com/apikey',
          errorType: 'InvalidAPIKey',
        },
        { status: 401 },
      )
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error.message,
        errorType: error.name,
      },
      { status: 500 },
    )
  }
}
