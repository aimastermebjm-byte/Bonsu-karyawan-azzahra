# 🚀 Deploy ke Netlify - Panduan Lengkap

## ❌ **Kenapa Data Kosong?**
Karena **Environment Variables Firebase belum diset** di Netlify!

## 📋 **Langkah-langkah Deploy:**

### **1. Download & Upload**
- Download semua file project ini
- Extract ke folder lokal
- Upload ke Netlify (drag & drop folder atau via Git)

### **2. ⚠️ WAJIB: Setup Environment Variables**
Masuk ke **Netlify Dashboard** → **Site Settings** → **Environment Variables**

Tambahkan variabel berikut (ambil dari website lama atau Firebase Console):

```
VITE_FIREBASE_API_KEY=AIzaSyC...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123
```

### **3. Cara Ambil Environment Variables:**

#### **Dari Website Lama:**
1. Buka website lama di Netlify
2. Site Settings → Environment Variables
3. Copy semua nilai `VITE_FIREBASE_*`

#### **Dari Firebase Console:**
1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project yang sama
3. Project Settings → General → Your apps
4. Copy config values

### **4. Redeploy**
Setelah environment variables diset:
1. Kembali ke **Deploys** tab
2. Klik **Trigger deploy** → **Deploy site**
3. Tunggu build selesai

### **5. Test Website**
- Buka URL Netlify baru
- Cek apakah bisa login
- Cek apakah data muncul
- Test input data baru

## 🔍 **Troubleshooting:**

### **Masih Blank Page?**
1. Buka Developer Tools (F12)
2. Lihat Console untuk error
3. Pastikan semua environment variables terisi
4. Cek Network tab untuk failed requests

### **Data Tidak Muncul?**
- Pastikan menggunakan Firebase project yang SAMA
- Cek `VITE_FIREBASE_PROJECT_ID` harus sama dengan website lama
- Pastikan Firestore rules mengizinkan read/write

### **Build Error?**
- Pastikan Node.js version 18
- Cek apakah semua dependencies terinstall
- Lihat build log untuk error detail

## 🎯 **Tips Sukses:**
1. **Gunakan Firebase project SAMA** untuk data menyatu
2. **Set environment variables DULU** sebelum deploy
3. **Test di local** dulu dengan `npm run dev`
4. **Backup data** sebelum migrasi

## 📞 **Butuh Bantuan?**
Jika masih error, share:
1. Screenshot error di Console (F12)
2. Build log dari Netlify
3. Environment variables yang sudah diset (tanpa nilai sensitif)

---
**PENTING**: Tanpa environment variables, website akan blank/kosong! ⚠️