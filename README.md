# Discount Store BD 🛍️🇧🇩

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Discount Store BD** is a modern e-commerce platform built for customers across Bangladesh, offering quality products at competitive prices with a simple, fast, and responsive shopping experience.

🔗 **Live Website:** https://discountstorebd.com/

---

## 🚀 Features

* 🛍️ **Product Catalog** — Browse products across multiple categories.
* 🔎 **Search & Filtering** — Search by keyword, category, price, and discounts.
* 🛒 **Shopping Cart** — Add products, update quantities, and manage cart items.
* ❤️ **Wishlist** — Save products for later.
* 💳 **Multiple Payment Methods** — COD, bKash, Nagad, Rocket, and SSLCommerz.
* 📦 **Order Management** — Place, track, and manage orders.
* 🔔 **Order Notifications** — Receive updates about order status.
* 👨‍💼 **Admin Dashboard** — Manage products, inventory, orders, and promotions.
* 📱 **Responsive Design** — Optimized for mobile, tablet, and desktop.
* ⚡ **Fast Performance** — Designed for reliable performance across Bangladesh.

---

## 🛠️ Tech Stack

### Frontend

* **Next.js / React.js**
* **JavaScript**
* **Tailwind CSS / Bootstrap**
* **Redux Toolkit / Context API**

### Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**
* **JWT Authentication**

### Payment & Services

* **SSLCommerz**
* **bKash Merchant API**
* **Nagad API**
* **Rocket**
* **SMS Gateway**

### Tools & Deployment

* Git & GitHub
* Postman
* VS Code
* Vercel
* DigitalOcean
* MongoDB Atlas

---

## 📁 Project Structure

```text
discount-store-bd/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   │
│   ├── .env.local
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── .env
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* [Node.js](https://nodejs.org/) v18 or higher
* npm v9 or higher
* Git
* MongoDB or MongoDB Atlas
* VS Code or another code editor

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/discountstorebd.git
cd discountstorebd
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## 🔐 Environment Variables

### Backend

Create:

```text
server/.env
```

Add:

```env
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/discountstorebd

JWT_SECRET=your_jwt_secret_key

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password

# bKash
BKASH_APP_KEY=your_bkash_app_key
BKASH_APP_SECRET=your_bkash_app_secret
BKASH_USERNAME=your_bkash_username
BKASH_PASSWORD=your_bkash_password
```

### Frontend

Create:

```text
client/.env.local
```

Add:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> ⚠️ **Never commit `.env` or `.env.local` files to GitHub.**

---

## ▶️ Run the Application

### Start Backend

```bash
cd server
npm run dev
```

Backend:

```text
http://localhost:5000
```

### Start Frontend

Open a new terminal:

```bash
cd client
npm run dev
```

Frontend:

```text
http://localhost:3000
```

---

## 🔌 API Endpoints

| Method | Endpoint                 | Description         | Access  |
| ------ | ------------------------ | ------------------- | ------- |
| `GET`  | `/api/products`          | Get all products    | Public  |
| `GET`  | `/api/products/:id`      | Get product details | Public  |
| `POST` | `/api/users/register`    | Register user       | Public  |
| `POST` | `/api/users/login`       | Login user          | Public  |
| `GET`  | `/api/users/profile`     | Get user profile    | Private |
| `POST` | `/api/orders`            | Create order        | Private |
| `GET`  | `/api/orders`            | Get user orders     | Private |
| `GET`  | `/api/orders/:id`        | Get order details   | Private |
| `POST` | `/api/payment/init`      | Initialize payment  | Private |
| `PUT`  | `/api/orders/:id/status` | Update order status | Admin   |

---

## 💳 Payment Flow

```text
Customer
   │
   ▼
Shopping Cart
   │
   ▼
Checkout
   │
   ▼
Select Payment Method
   │
   ├── Cash on Delivery
   ├── bKash
   ├── Nagad
   ├── Rocket
   └── SSLCommerz
   │
   ▼
Payment Processing
   │
   ▼
Payment Verification
   │
   ▼
Order Confirmation
   │
   ▼
Order Tracking
```

---

## 📦 Order Status

Orders can move through the following stages:

```text
Pending
   ↓
Confirmed
   ↓
Processing
   ↓
Shipped
   ↓
Out for Delivery
   ↓
Delivered
```

Additional statuses:

* Cancelled
* Failed
* Returned

---

## 🔒 Security

The application implements several security practices:

* JWT-based authentication
* Password hashing
* Protected API routes
* Role-based authorization
* Input validation
* Secure environment variables
* CORS configuration
* Protected admin routes
* Payment verification

---

## 📜 Available Scripts

### Frontend

```bash
npm run dev
```

Start development server.

```bash
npm run build
```

Create production build.

```bash
npm run start
```

Start production server.

```bash
npm run lint
```

Run ESLint.

### Backend

```bash
npm run dev
```

Start development server.

```bash
npm start
```

Start production server.

---

## 🚀 Deployment

### Frontend

Recommended platforms:

* Vercel
* Netlify
* AWS
* DigitalOcean

### Backend

Recommended platforms:

* DigitalOcean
* AWS
* Render
* Railway
* VPS

### Database

* MongoDB Atlas
* Self-hosted MongoDB

---

## 🤝 Contributing

Contributions are welcome!

### Steps

1. Fork the repository.
2. Create a feature branch:

```bash
git checkout -b feature/AmazingFeature
```

3. Make your changes.
4. Commit your changes:

```bash
git commit -m "Add AmazingFeature"
```

5. Push your branch:

```bash
git push origin feature/AmazingFeature
```

6. Open a Pull Request.

---

## 🐛 Issues

If you find a bug or have a feature request, please open an issue and provide:

* Clear description of the issue
* Steps to reproduce
* Expected behavior
* Actual behavior
* Screenshots, if applicable

---

## 📄 License

This project is licensed under the **MIT License**.

See the [`LICENSE`](LICENSE) file for details.

---

## 📞 Contact

### Discount Store BD

🌐 **Website:** https://discountstorebd.com/

📧 **Email:** [support@discountstorebd.com](mailto:support@discountstorebd.com)

📍 **Location:** Dhaka, Bangladesh

---

## ⭐ Support

If you find this project useful, please consider giving the repository a ⭐ on GitHub.

**Built with ❤️ in Bangladesh 🇧🇩**
