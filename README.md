# 🛍️ E-commerce Admin Panel

Professional va to'liq funksional e-commerce admin panel Next.js, MongoDB va NextAuth bilan qurilgan.

![Next.js](https://img.shields.io/badge/Next.js-13.4-black)
![React](https://img.shields.io/badge/React-18.2-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-5.4-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38bdf8)

## ✨ Asosiy Funksiyalar

### 📦 Mahsulot Boshqaruvi
- ✅ **To'liq CRUD operatsiyalari** (Create, Read, Update, Delete)
- ✅ **Drag & drop image upload** (Cloudinary integratsiyasi)
- ✅ **Kategoriya tizimi** (11 ta predefined kategoriya)
- ✅ **Real-time search** (mahsulot nomi bo'yicha)
- ✅ **Advanced filter** (kategoriya bo'yicha)
- ✅ **6 xil sort** (yangilar, eskilar, narx, nom)
- ✅ **Smart pagination** (5, 10, 25, 50 items per page)
- ✅ **Image thumbnails** table'da
- ✅ **Excel/CSV'dan import** — namuna fayl, tekshiruv va qatorlar bo'yicha hisobot
- ✅ **Excel'ga eksport** — joriy filtr bo'yicha, qayta import qilsa bo'ladigan formatda
- ✅ **Responsive design**

### 📊 Dashboard & Analytics
- ✅ **4 ta statistika card:**
  - Jami mahsulotlar soni
  - Ombor qiymati va umumiy stock
  - Buyurtmalar soni va savdo summasi
  - Kam qolgan / tugagan mahsulotlar
- ✅ **Oxirgi 5 ta buyurtma va mahsulot**
- ✅ **Kategoriyalar statistikasi**
- ✅ **Kam qolgan chegarasi sozlamalardan olinadi**

### 📦 Buyurtma Boshqaruvi
- ✅ **Order CRUD operatsiyalari**
- ✅ **Auto-generated order numbers** (ORD-000001)
- ✅ **5 xil status tracking:**
  - Kutilmoqda (yellow)
  - Tasdiqlandi (blue)
  - Yetkazilmoqda (purple)
  - Yetkazildi (green)
  - Bekor qilindi (red)
- ✅ **Inline status update**
- ✅ **Status bo'yicha filter**
- ✅ **Buyurtma yaratish sahifasi** (mahsulot tanlash, miqdor, jami summa)
- ✅ **Avtomatik stock boshqaruvi** — buyurtma stockni kamaytiradi,
  bekor qilish yoki o'chirish esa qaytaradi
- ✅ **Narxlar serverda bazadan olinadi** (client tomondan o'zgartirib bo'lmaydi)
- ✅ **Excel'ga eksport** — buyurtmalar va mahsulotlar tafsiloti alohida varaqlarda

### 🔐 Authentication & Security
- ✅ **Google OAuth** (NextAuth.js)
- ✅ **Session management**
- ✅ **Protected API routes**
- ✅ **Logout functionality**
- ✅ **User profil header**

### 🎨 UI/UX
- ✅ **Toast notifications** (react-hot-toast)
- ✅ **Tasdiqlash modali** (window.confirm o'rniga)
- ✅ **Stock rangli belgilar** (yashil / sariq / qizil)
- ✅ **Loading states**
- ✅ **Error handling**
- ✅ **Professional design** (Tailwind CSS)
- ✅ **Responsive layout** (mobile-friendly)
- ✅ **Hover effects**
- ✅ **Color-coded badges**

### ⚙️ Settings
- ✅ User profil ma'lumotlari
- ✅ **Do'kon sozlamalari** (nom, telefon, manzil, email) — bazaga saqlanadi
- ✅ **Valyuta tanlash** (so'm, $, €, ₽)
- ✅ **Kam qolgan ogohlantirish chegarasi** — dashboardga ta'sir qiladi
- ✅ Tizim ma'lumotlari

---

## 🚀 O'rnatish va Ishga Tushirish

### Talablar

- Node.js 18+ yoki 20+
- Yarn yoki npm
- MongoDB Atlas akkaunti
- Google Cloud Console OAuth akkaunti

### 1. Repositoriyani clone qiling

```bash
git clone https://github.com/AnonymousSherali/t-sale.git
cd t-sale
```

### 2. Dependencies o'rnatish

```bash
yarn install
# yoki
npm install
```

### 3. Environment Variables sozlash

`.env.example` faylidan `.env` fayli yarating:

```bash
cp .env.example .env
```

`.env` faylini quyidagi ma'lumotlar bilan to'ldiring:

```env
# Google OAuth (https://console.cloud.google.com/)
GOOGLE_ID="your-google-client-id"
GOOGLE_SECRET="your-google-client-secret"

# MongoDB (https://cloud.mongodb.com/)
MONGODB_URI="your-mongodb-connection-string"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="random-secret-key-32-characters-long"

# Cloudinary — rasm yuklash uchun (https://cloudinary.com/)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Environment
NODE_ENV="development"
```

#### Google OAuth sozlash:

1. [Google Cloud Console](https://console.cloud.google.com/)ga kiring
2. Yangi loyiha yarating yoki mavjudini tanlang
3. **APIs & Services > Credentials**ga o'ting
4. **Create Credentials > OAuth 2.0 Client ID** bosing
5. **Authorized redirect URIs** qo'shing:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
6. Client ID va Client Secret'ni `.env` fayliga qo'shing

#### MongoDB sozlash:

1. [MongoDB Atlas](https://cloud.mongodb.com/)da akkount yarating
2. Yangi cluster yarating (M0 Free tier yetarli)
3. **Database Access**da yangi user yarating
4. **Network Access**da IP addressingizni qo'shing (yoki `0.0.0.0/0` - hammaga ruxsat)
5. **Connect > Connect your application** orqali connection string oling
6. Connection string'ni `.env` fayliga qo'shing

#### NextAuth Secret yaratish:

```bash
openssl rand -base64 32
```

Natijani `NEXTAUTH_SECRET` ga qo'shing.

### 4. Loyihani ishga tushiring

```bash
yarn dev
# yoki
npm run dev
```

Brauzerda ochish: [http://localhost:3000](http://localhost:3000)

---

## 📖 Foydalanish

### Tizimga kirish

1. Brauzerni oching: `http://localhost:3000`
2. **Login with Google** tugmasini bosing
3. Google akkaunti bilan tizimga kiring
4. Dashboard sahifasiga yo'naltirilasiz

### Mahsulot qo'shish

1. **Products** sahifasiga o'ting
2. **Yangi mahsulot qo'shish** tugmasini bosing
3. Formani to'ldiring:
   - Mahsulot nomi (majburiy)
   - Kategoriya (dropdown)
   - Tavsif
   - Narx (majburiy)
   - Miqdor
   - SKU
   - Rasmlar (drag & drop yoki click to upload)
4. **Saqlash** tugmasini bosing
5. Toast notification ko'rsatiladi

### Excel'dan import qilish

1. **Mahsulotlar** sahifasida **Excel'dan import** tugmasini bosing
2. **Namuna faylni yuklab olish** — kerakli ustunlar bilan tayyor `.xlsx`
3. Faylni to'ldiring va oynaga torting (`.xlsx` yoki `.csv`, max 5MB)
4. Tizim faylni tekshiradi va ko'rsatadi:
   - nechta mahsulot qo'shiladi
   - qaysi qatorlar o'tkazib yuboriladi va nima sababdan
   - ogohlantirishlar (masalan, ro'yxatda yo'q kategoriya)
5. **Qo'shish** tugmasini bosing — faqat shundan keyin bazaga yoziladi

**Ustunlar:** Nomi va Narxi majburiy; Kategoriya, Tavsif, Miqdor, SKU, Rasmlar
ixtiyoriy. Sarlavhalar o'zbekcha ham, inglizcha ham (`Title`, `Price`, `Stock`…)
tanib olinadi. `5 000 000` va `1,200,000` kabi formatlangan sonlar qabul qilinadi.
Takrorlangan SKU'lar — fayl ichida ham, bazada ham — rad etiladi.

### Excel'ga eksport qilish

**Mahsulotlar** sahifasidagi **Excel'ga eksport** tugmasi joriy qidiruv, kategoriya
filtri va tartiblashni hisobga oladi — yuklab olingan fayl ekrandagi jadvalga mos
keladi. Filtr qo'llanilgan bo'lsa, tugmada nechta mahsulot eksport qilinishi
ko'rsatiladi.

Fayl `Nomi`, `Kategoriya`, `Narxi`, `Miqdor`, `Umumiy qiymat`, `SKU`, `Tavsif`,
`Rasmlar`, `Qo'shilgan sana` ustunlaridan iborat. Narx va sana Excel'da haqiqiy
son va sana sifatida saqlanadi, shuning uchun ularni to'g'ridan-to'g'ri
jamlash va saralash mumkin. Sarlavha muzlatilgan va avtofiltr yoqilgan.

**Eksport qilingan faylni tahrirlab, qayta import qilish mumkin** — importer
`Narxi (so'm)` kabi o'lchov birligi qo'shilgan sarlavhalarni ham tanib oladi,
`Umumiy qiymat` va `Qo'shilgan sana` ustunlarini esa e'tiborga olmaydi.

**Buyurtmalar** sahifasida ham eksport bor. Fayl ikki varaqdan iborat:
*Buyurtmalar* (har bir buyurtma bitta qator) va *Mahsulotlar tafsiloti*
(har bir sotilgan mahsulot bitta qator — mahsulot kesimida jamlash uchun).
Status filtri qo'llanilgan bo'lsa, eksport ham shu statusdagi buyurtmalarni oladi.

### Mahsulotlarni qidirish va filterlash

1. **Products** sahifasida:
   - **Search box**: Mahsulot nomini kiriting
   - **Kategoriya filter**: Kategoriyani tanlang
   - **Sort dropdown**: Tartiblash usulini tanlang
2. Natijalar real-time yangilanadi

### Mahsulotni tahrirlash

1. Mahsulot qatorida **Tahrirlash** tugmasini bosing
2. Ma'lumotlarni o'zgartiring
3. **Saqlash** tugmasini bosing

### Mahsulotni o'chirish

1. Mahsulot qatorida **O'chirish** tugmasini bosing
2. Confirmation dialog'da tasdiqlang
3. Mahsulot o'chiriladi va toast notification ko'rsatiladi

### Buyurtmalarni ko'rish

1. **Orders** sahifasiga o'ting
2. Barcha buyurtmalar card formatida ko'rsatiladi
3. Har bir buyurtmada:
   - Order number
   - Mijoz ma'lumotlari
   - Mahsulotlar ro'yxati
   - Jami summa
   - Status

### Buyurtma yaratish

1. **Buyurtmalar** sahifasida **Yangi buyurtma** tugmasini bosing
2. Mijoz ma'lumotlarini kiriting (ism, telefon, manzil majburiy)
3. Mahsulotlarni dropdown'dan tanlang va sonini kiriting
   — omborda yetarli emas bo'lsa ogohlantirish chiqadi
4. **Buyurtmani saqlash** — mahsulotlar ombordan avtomatik ayiriladi

### Buyurtma statusini o'zgartirish

1. Buyurtma cardida status dropdown'ni oching
2. Yangi statusni tanlang
3. Avtomatik yangilanadi va toast notification ko'rsatiladi
4. **Bekor qilindi** statusiga o'tkazilsa mahsulotlar omborga qaytariladi

### Dashboard ko'rish

1. **Dashboard** (Home) sahifasida:
   - 4 ta statistika card ko'rsatiladi
   - Oxirgi mahsulotlar ro'yxati
   - Kategoriyalar statistikasi
2. Barcha ma'lumotlar real-time yangilanadi

---

## 🗂️ Loyiha Tuzilishi

```
t-sale/
├── components/              # React komponentlar
│   ├── Layout.js           # Main layout (sidebar, header, logout)
│   ├── Nav.js              # Navigation sidebar
│   ├── ProductForm.js      # Qayta ishlatiladigan mahsulot form
│   ├── ImageUpload.js      # Drag & drop image upload
│   ├── ProductThumbnail.js # Rasm + fallback placeholder
│   ├── ImportProducts.js   # Excel import modali
│   ├── ExportButton.js     # Excel eksport tugmasi
│   └── ConfirmDialog.js    # Tasdiqlash modali
├── pages/                   # Next.js sahifalar (file-based routing)
│   ├── _app.js             # Global app wrapper
│   ├── _document.js        # HTML document
│   ├── index.js            # Dashboard (/)
│   ├── products.js         # Products list (/products)
│   ├── orders.js           # Orders list (/orders)
│   ├── orders/
│   │   └── new.js          # Yangi buyurtma
│   ├── settings.js         # Settings (/settings)
│   ├── products/
│   │   ├── new.js          # New product form
│   │   └── edit/
│   │       └── [...id].js  # Edit product
│   └── api/                # Backend API routes
│       ├── auth/
│       │   └── [...nextauth].js  # NextAuth config
│       ├── products/
│       │   ├── index.js    # GET, POST
│       │   ├── [id].js     # GET, PUT, DELETE
│       │   ├── import.js   # Excel/CSV import + namuna fayl
│       │   └── export.js   # Excel eksport
│       ├── orders/
│       │   ├── index.js    # GET, POST
│       │   ├── [id].js     # GET, PUT, DELETE
│       │   └── export.js   # Excel eksport
│       ├── stats.js        # Dashboard statistics
│       ├── settings.js     # Do'kon sozlamalari
│       └── upload.js       # Image upload (Cloudinary)
├── models/                  # Mongoose schemas
│   ├── Product.js          # Product model
│   ├── Order.js            # Order model
│   └── Setting.js          # Do'kon sozlamalari
├── lib/                     # Utility files
│   ├── mongoose.js         # MongoDB connection
│   ├── mongodb.js          # NextAuth MongoDB adapter
│   ├── apiHelpers.js       # Auth guard, field whitelist, xato formatlash
│   ├── productImport.js    # Excel ustunlarini moslash va qatorlarni tekshirish
│   ├── productFilters.js   # Filtr va tartiblash (sahifa + eksport uchun umumiy)
│   ├── excelExport.js      # Excel varaq yasash va yuborish
│   ├── orderStatus.js      # Status ro'yxati (model + API + UI uchun yagona manba)
│   └── categories.js       # Predefined kategoriyalar
├── styles/
│   └── globals.css         # Global Tailwind CSS
├── .env                     # Environment variables (gitignore)
├── .env.example            # Environment template
├── package.json            # Dependencies
└── README.md               # Bu fayl
```

---

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/signin` - Google OAuth login
- `POST /api/auth/signout` - Logout

### Products

- `GET /api/products` - Barcha mahsulotlar
- `POST /api/products` - Yangi mahsulot yaratish
- `GET /api/products/import` - Namuna .xlsx faylni yuklab olish
- `POST /api/products/import` - Excel/CSV import (`dryRun=true` — faqat tekshirish)
- `GET /api/products/export` - Excel eksport (`search`, `category`, `sortBy` parametrlari)
- `GET /api/products/:id` - Bitta mahsulot
- `PUT /api/products/:id` - Mahsulotni yangilash
- `DELETE /api/products/:id` - Mahsulotni o'chirish

### Orders

- `GET /api/orders` - Barcha buyurtmalar
- `POST /api/orders` - Yangi buyurtma yaratish (narxlar bazadan olinadi, stock kamayadi)
- `GET /api/orders/:id` - Bitta buyurtma
- `PUT /api/orders/:id` - Buyurtmani yangilash (bekor qilinsa stock qaytadi)
- `DELETE /api/orders/:id` - Buyurtmani o'chirish (stock qaytariladi)
- `GET /api/orders/export` - Excel eksport (`status` parametri)

### Settings

- `GET /api/settings` - Do'kon sozlamalari
- `PUT /api/settings` - Sozlamalarni saqlash

### Statistics

- `GET /api/stats` - Dashboard statistikasi (mahsulot + buyurtma + savdo)

### Upload

- `POST /api/upload` - Rasm yuklash (Cloudinary)

**Authentication:** Barcha API endpoints NextAuth session bilan himoyalangan.

---

## 🛠️ Technologies

| Texnologiya | Versiya | Maqsad |
|------------|---------|---------|
| Next.js | 13.4.0 | React framework |
| React | 18.2.0 | UI library |
| MongoDB | 5.4.0 | NoSQL database |
| Mongoose | 9.1.5 | MongoDB ODM |
| NextAuth.js | 4.22.1 | Authentication |
| Tailwind CSS | 3.3.2 | Styling |
| axios | 1.13.2 | HTTP client |
| react-hot-toast | 2.6.0 | Notifications |
| react-dropzone | 14.3.8 | File upload |
| cloudinary | 2.9.0 | Rasm hosting |
| formidable | 3.5.4 | Multipart form parsing |
| exceljs | 4.4.0 | Excel/CSV o'qish va yozish |

---

## 📝 Database Schemas

### Product Schema

```javascript
{
  title: String (required, max 200),
  description: String (max 2000),
  price: Number (required, min 0),
  category: String (default: 'Boshqa'),
  images: [String],
  stock: Number (default: 0, min 0),
  sku: String (unique),
  properties: Object,
  timestamps: true (createdAt, updatedAt)
}
```

### Order Schema

```javascript
{
  orderNumber: String (auto-generated, unique),
  customerName: String (required),
  customerEmail: String,
  customerPhone: String (required),
  customerAddress: String (required),
  items: [{
    product: ObjectId (ref: 'Product'),
    title: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number (required),
  status: String (enum: 5 xil),
  notes: String,
  timestamps: true
}
```

---

## 🔧 Sozlamalar

### Cloudinary (Production uchun)

Hozirda demo Cloudinary ishlatyapti. O'z akkauntingizni ulash:

1. [Cloudinary](https://cloudinary.com/)da akkount yarating
2. Dashboard'dan ma'lumotlarni oling
3. `.env` fayliga qo'shing:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

4. `components/ImageUpload.js` va `pages/api/upload.js` fayllarini yangilang

### Tailwind CSS

Tailwind sozlamalari `tailwind.config.js` faylida:

```javascript
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

## 🚀 Production Deploy

### Vercel (Tavsiya etiladi)

1. GitHub repo'ni Vercel'ga bog'lang
2. Environment variables'ni qo'shing:
   - `GOOGLE_ID`
   - `GOOGLE_SECRET`
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (production URL)
   - `NEXTAUTH_SECRET`
   - `NODE_ENV=production`
3. **Deploy** bosing
4. Google OAuth'da production URL'ni qo'shing:
   ```
   https://your-domain.vercel.app/api/auth/callback/google
   ```

### Boshqa platformalar

- **Netlify**: Next.js plugin bilan
- **Railway**: MongoDB bilan birga
- **DigitalOcean**: App Platform
- **AWS**: Amplify yoki EC2

---

## 📚 Qo'shimcha Hujjatlar

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Guide](https://next-auth.js.org/getting-started/introduction)
- [MongoDB Atlas Tutorial](https://docs.atlas.mongodb.com/getting-started/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

## 🐛 Troubleshooting

### MongoDB ulanish xatosi

```bash
Error: connect ECONNREFUSED
```

**Yechim:**
1. MongoDB URI to'g'riligini tekshiring
2. IP whitelist'ga `0.0.0.0/0` qo'shing
3. Username va password to'g'riligini tekshiring

### Google OAuth xatosi

```bash
Error: invalid_client
```

**Yechim:**
1. `GOOGLE_ID` va `GOOGLE_SECRET` to'g'riligini tekshiring
2. Redirect URI to'g'ri sozlanganini tekshiring
3. Google Cloud Console'da OAuth Consent Screen'ni to'ldiring

### Image upload ishlamayapti

**Yechim:**
1. Cloudinary ma'lumotlarini tekshiring
2. Browser console'da xatolarni ko'ring
3. Demo Cloudinary limitga yetgan bo'lishi mumkin - o'z akkauntingizni ulang

### Session saqlanmayapti

**Yechim:**
1. `NEXTAUTH_SECRET` sozlanganini tekshiring
2. MongoDB connection ishlayotganini tekshiring
3. Browser cookies yoqilganini tekshiring

---

## 🤝 Contributing

Pull requestlar qabul qilinadi! Katta o'zgarishlar uchun avval issue oching.

1. Fork qiling
2. Feature branch yarating (`git checkout -b feature/AmazingFeature`)
3. Commit qiling (`git commit -m 'Add some AmazingFeature'`)
4. Push qiling (`git push origin feature/AmazingFeature`)
5. Pull Request oching

---

## 📄 License

MIT License - batafsil ma'lumot uchun `LICENSE` faylini ko'ring.

---

## 👤 Author

**Sherali**

- GitHub: [@AnonymousSherali](https://github.com/AnonymousSherali)

---

## ⭐ Support

Agar loyiha foydali bo'lsa, star bering! ⭐

---

## 🎯 Keyingi Yangilanishlar

- [ ] Multi-user support (Admin, Moderator roles)
- [ ] Email notifications (order status changes)
- [ ] Export data (Excel, PDF)
- [ ] Analytics charts (Chart.js)
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Product variants (size, color)
- [ ] Inventory tracking
- [ ] Customer management

---

Made with ❤️ using Next.js and MongoDB
