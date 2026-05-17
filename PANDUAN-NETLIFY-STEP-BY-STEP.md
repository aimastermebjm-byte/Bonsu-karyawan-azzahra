# 🚀 PANDUAN STEP-BY-STEP: Setup Environment Variables di Netlify

## 📋 **LANGKAH 1: Ambil Config dari Firebase**

### **1.1 Buka Firebase Console**
- Buka [https://console.firebase.google.com](https://console.firebase.google.com)
- Klik project **"Azzahra packing"**

### **1.2 Masuk ke Project Settings**
- Klik ⚙️ **"Project Settings"** (icon gear di kiri atas)
- Atau klik **"Project Settings"** di menu kiri

### **1.3 Cari Web App Config**
- Scroll ke bawah sampai bagian **"Your apps"**
- Jika ada web app, klik **"Config"** 
- Jika belum ada, klik **"Add app"** → pilih **Web** `</>`

### **1.4 Copy Config Values**
Akan muncul seperti ini:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdef",
  authDomain: "azzahra-packing.firebaseapp.com", 
  projectId: "azzahra-packing",
  storageBucket: "azzahra-packing.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

**CATAT/SCREENSHOT** semua nilai ini!

---

## 📋 **LANGKAH 2: Setup di Netlify Website Baru**

### **2.1 Buka Netlify Dashboard**
- Login ke [https://app.netlify.com](https://app.netlify.com)
- Pilih website **BARU** yang sudah di-deploy dari Bolt

### **2.2 Masuk ke Site Settings**
- Klik **"Site settings"** (tombol di kanan atas)
- Atau klik **"Site configuration"** di menu kiri

### **2.3 Cari Environment Variables**
- Di menu kiri, klik **"Environment variables"**
- Atau scroll ke bawah sampai ketemu **"Environment variables"**

### **2.4 Tambah Variables Satu per Satu**
Klik **"Add a variable"** → **"Add a single variable"**

**Variable 1:**
- Key: `VITE_FIREBASE_API_KEY`
- Value: `AIzaSyC1234567890abcdef` (dari Firebase config)
- Klik **"Create variable"**

**Variable 2:**
- Key: `VITE_FIREBASE_AUTH_DOMAIN` 
- Value: `azzahra-packing.firebaseapp.com` (dari Firebase config)
- Klik **"Create variable"**

**Variable 3:**
- Key: `VITE_FIREBASE_PROJECT_ID`
- Value: `azzahra-packing` (dari Firebase config)
- Klik **"Create variable"**

**Variable 4:**
- Key: `VITE_FIREBASE_STORAGE_BUCKET`
- Value: `azzahra-packing.appspot.com` (dari Firebase config)
- Klik **"Create variable"**

**Variable 5:**
- Key: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- Value: `123456789012` (dari Firebase config)
- Klik **"Create variable"**

**Variable 6:**
- Key: `VITE_FIREBASE_APP_ID`
- Value: `1:123456789012:web:abcdef1234567890` (dari Firebase config)
- Klik **"Create variable"**

**Variable 7 (Opsional):**
- Key: `VITE_FIREBASE_MEASUREMENT_ID`
- Value: `G-XXXXXXXXXX` (jika ada di Firebase config)
- Klik **"Create variable"**

---

## 📋 **LANGKAH 3: Redeploy Website**

### **3.1 Kembali ke Deploys**
- Klik **"Deploys"** di menu atas
- Atau klik **"Site overview"** → **"Deploys"**

### **3.2 Trigger Deploy Ulang**
- Klik **"Trigger deploy"** (tombol hijau)
- Pilih **"Deploy site"**
- Tunggu proses build selesai (2-3 menit)

### **3.3 Test Website**
- Klik URL website setelah deploy selesai
- Test login dengan:
  - Username: `Faizal` Password: `123` (employee)
  - Username: `azp` Password: `123` (owner)
- Test input data produksi
- Cek apakah data muncul

---

## 🔍 **TROUBLESHOOTING**

### **Jika Website Masih Blank:**
1. Tekan **F12** di browser
2. Lihat **Console** tab
3. Screenshot error yang muncul

### **Jika Login Tidak Bisa:**
- Pastikan semua environment variables sudah diset
- Cek tidak ada typo di Key atau Value
- Redeploy ulang

### **Jika Data Tidak Muncul:**
- Pastikan `VITE_FIREBASE_PROJECT_ID` sama dengan project Firebase
- Cek Firestore Database sudah dibuat di Firebase Console

---

## ✅ **CHECKLIST**

- [ ] Ambil config dari Firebase project "Azzahra packing"
- [ ] Set 6-7 environment variables di Netlify
- [ ] Redeploy website
- [ ] Test login berhasil
- [ ] Test input data berhasil
- [ ] Data muncul di website

---

## 🆘 **BUTUH BANTUAN?**

Jika ada langkah yang bingung:
1. Screenshot halaman yang sedang dibuka
2. Tanyakan langkah spesifik yang bingung
3. Saya akan bantu lebih detail lagi!

**INGAT**: Ganti semua nilai contoh dengan nilai ASLI dari Firebase config Anda! 🔥