# 🕌 HalalFlow - Aplikasi Manajemen Keuangan Islami

HalalFlow adalah aplikasi manajemen keuangan berbasis web yang dirancang dengan prinsip-prinsip keuangan Islami. Aplikasi ini membantu pengguna mengelola pemasukan, pengeluaran, budget planning, dan melacak transaksi keuangan dengan mudah dan terstruktur.

## ✨ Fitur Utama

- 🔐 **Autentikasi Lengkap**
  - Register dengan nama lengkap
  - Login dengan email & password
  - Forgot Password & Reset Password via email
  - JWT-based authentication

- 📊 **Dashboard Informatif**
  - Total saldo terkini
  - Total pemasukan
  - Total pengeluaran
  - Visualisasi keuangan

- 💰 **Manajemen Transaksi**
  - Tambah, edit, hapus transaksi
  - Kategorisasi pemasukan & pengeluaran
  - Filter berdasarkan tipe, bulan, dan tahun
  - Deskripsi detail transaksi

- 🏷️ **Manajemen Kategori**
  - Kategori custom untuk pemasukan
  - Kategori custom untuk pengeluaran
  - Edit & hapus kategori

- 📅 **Budget Planner**
  - Perencanaan anggaran bulanan
  - Tracking pencapaian budget
  - Notifikasi budget limit

- 🎨 **UI/UX Modern**
  - Design clean dan minimalis
  - Light mode dengan warna solid
  - Custom styled dropdowns
  - Responsive design
  - Icon-based navigation

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - UI Library
- **React Router v6** - Routing
- **Axios** - HTTP Client
- **Iconify** - Icon system
- **CSS3** - Styling with CSS Variables

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service

## 📋 Prerequisites

Sebelum memulai, pastikan sudah terinstall:

- **Node.js** (v14 atau lebih baru)
- **PostgreSQL** (v12 atau lebih baru)
- **npm** atau **yarn**

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/HalalFlowApp.git
cd HalalFlowApp
```

### 2. Setup Backend

```bash
cd backend
npm install
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

## ⚙️ Konfigurasi

### Database Setup

1. Buat database PostgreSQL:

```sql
CREATE DATABASE halalflow;
```

2. Jalankan schema database di `backend/src/db/init.sql`:

```bash
psql -U postgres -d halalflow -f src/db/init.sql
```

### Environment Variables

#### Backend (.env)

Buat file `.env` di folder `backend/`:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_DATABASE=halalflow
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

**Note**: Untuk `EMAIL_PASS`, gunakan App Password dari Gmail (bukan password akun Gmail biasa).

#### Frontend (.env)

Buat file `.env` di folder `frontend/`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🏃 Menjalankan Aplikasi

### Development Mode

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

Server akan berjalan di `http://localhost:5000`

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

Aplikasi akan buka otomatis di `http://localhost:3000`

## 📁 Struktur Project

```
HalalFlowApp/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── db/               # Database config & schema
│   │   ├── middleware/       # Authentication middleware
│   │   ├── routes/           # API endpoints
│   │   └── app.js            # Express app entry
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── context/          # React Context (Auth)
│   │   ├── pages/            # Page components
│   │   ├── services/         # API services
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request reset password
- `POST /api/auth/reset-password` - Reset password dengan token

### Transactions
- `GET /api/transactions` - Get semua transaksi
- `POST /api/transactions` - Tambah transaksi baru
- `PUT /api/transactions/:id` - Update transaksi
- `DELETE /api/transactions/:id` - Hapus transaksi

### Categories
- `GET /api/categories` - Get semua kategori
- `POST /api/categories` - Tambah kategori baru
- `PUT /api/categories/:id` - Update kategori
- `DELETE /api/categories/:id` - Hapus kategori

### Budget
- `GET /api/budgets` - Get semua budget
- `POST /api/budgets` - Tambah budget baru
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Hapus budget

### Dashboard
- `GET /api/dashboard/summary` - Get financial summary

## 🔒 Security

- Password di-hash menggunakan bcrypt
- JWT token untuk autentikasi
- Protected routes dengan middleware
- Environment variables untuk data sensitif
- SQL injection prevention dengan parameterized queries

## 📝 Development Notes

### Konvensi Kode
- Gunakan ES6+ syntax
- Async/await untuk async operations
- Meaningful variable & function names
- Komentar untuk logic kompleks

### Git Workflow
1. Create feature branch
2. Commit dengan pesan jelas
3. Push ke branch
4. Create Pull Request

## 🐛 Troubleshooting

**Database connection error:**
- Pastikan PostgreSQL running
- Cek credentials di `.env`
- Pastikan database `halalflow` sudah dibuat

**Email not sending:**
- Pastikan menggunakan App Password Gmail
- Enable "Less secure app access" jika perlu
- Cek EMAIL_USER dan EMAIL_PASS di `.env`

**Frontend can't connect to backend:**
- Pastikan backend running di port 5000
- Cek REACT_APP_API_URL di frontend `.env`
- Clear browser cache & restart frontend

## 🤝 Contributing

Contributions are welcome! Silakan:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Rizky Septian**
- Email: rizkyseptian401@gmail.com
- GitHub: [@rizkyseptian](https://github.com/rizkyseptian)

## 🙏 Acknowledgments

- Terima kasih kepada komunitas open source
- Inspirasi dari prinsip keuangan Islami
- Built with ❤️ for better financial management

---

⭐ Jika project ini membantu, jangan lupa kasih star!
