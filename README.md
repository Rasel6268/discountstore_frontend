# Discount Store BD 🛍️🇧🇩

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Discount Store BD** is an e-commerce platform dedicated to offering high-quality products at competitive discount prices across Bangladesh. Built with modern web technologies, it features dynamic product categories, secure local payment gateway integrations, and an intuitive user experience optimized for both mobile and desktop users.

🔗 **Live Website:** [https://discountstorebd.com/](https://discountstorebd.com/)

---

## 🚀 Key Features

- **Product Catalog & Categorization:** Easy navigation through electronics, fashion, lifestyle items, and daily household essentials.
- **Dynamic Search & Filtering:** Search products by keyword, category, price range, and discount tags.
- **Shopping Cart & Wishlist:** Real-time state management allowing users to save items and manage quantities effortlessly.
- **Bangladeshi Payment Gateways:** Seamless integration supporting Cash on Delivery (COD), bKash, Nagad, Rocket, and SSLCommerz credit/debit card processing.
- **Order Tracking & Notifications:** Real-time updates on order processing, dispatch, and delivery status.
- **Admin Dashboard:** Back-office interface to handle inventory, track sales, process customer orders, and update discount promotions.
- **Responsive & Fast:** Optimized for fast loading times across 3G/4G/5G mobile networks in Bangladesh.

---

## 🛠️ Tech Stack

### **Frontend**
- Framework: React / Next.js *(or HTML5/CSS3/JavaScript)*
- Styling: Tailwind CSS / Bootstrap
- State Management: Redux Toolkit / Context API

### **Backend**
- Server/API: Node.js (Express) / PHP (Laravel)
- Database: MongoDB / PostgreSQL / MySQL
- Authentication: JWT / OAuth 2.0

### **Integrations**
- Payment Gateways: SSLCommerz, bKash Merchant API, Nagad API
- SMS Gateway: Bulk SMS API for order confirmation (e.g., Greenweb, Teletalk)
- Hosting & Infrastructure: Vercel / AWS / DigitalOcean

---

## 📁 Project Structure

```text
discount-store-bd/
├── public/                 # Static assets (images, icons, favicons)
├── src/
│   ├── assets/             # Brand logos, styling stylesheets, and vectors
│   ├── components/         # Reusable UI components (Navbar, Footer, ProductCard, Cart)
│   ├── pages/              # Main route views (Home, Shop, Cart, Checkout, Dashboard)
│   ├── services/           # API call functions (Payment APIs, Product fetching)
│   ├── context/            # React state context / Redux store slices
│   └── utils/              # Helper functions (currency formatting BDT ৳, validators)
├── .env.example            # Environment variable template
├── package.json            # Project dependencies and scripts
└── README.md               # Project documentation

🚀 Getting StartedFollow these step-by-step instructions to get a copy of the project running on your local machine for development and testing.PrerequisitesMake sure you have the following installed on your machine:Node.js (v18.0.0 or higher recommended)npm (v9.0.0 or higher) or yarnGitMongoDB (Local or MongoDB Atlas URI)InstallationClone the repository:Bashgit clone [https://github.com/your-username/discountstorebd.git](https://github.com/your-username/discountstorebd.git)
cd discountstorebd
Install Root and Sub-directory Dependencies:For Frontend:Bashcd client
npm install
For Backend:Bashcd ../server
npm install
Environment ConfigurationCreate a .env file in both the client and server directories based on the templates below.Server Environment Variables (/server/.env):Code snippetPORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/discountstorebd
JWT_SECRET=your_jwt_secret_key_here

# Payment Gateway Credentials
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
BKASH_APP_KEY=your_bkash_key
BKASH_APP_SECRET=your_bkash_secret
Client Environment Variables (/client/.env.local):Code snippetNEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
Running the ProjectStart the Backend Server:Bashcd server
npm run dev
Backend running on: http://localhost:5000Start the Frontend Client:Open a new terminal tab/window:Bashcd client
npm run dev
Frontend running on: http://localhost:3000🔌 API Endpoints SummaryMethodEndpointDescriptionAccessGET/api/productsGet all listed productsPublicGET/api/products/:idGet single product detailsPublicPOST/api/users/registerRegister new userPublicPOST/api/users/loginUser authentication & tokenPublicPOST/api/ordersPlace a new orderPrivatePOST/api/payment/initInitialize payment gatewayPrivate📜 Available ScriptsIn the project client/server directory, you can run:npm run dev: Runs the app in development mode.npm run build: Builds the app for production deployment.npm run start: Starts the production server.npm run lint: Checks for code linting errors.🤝 ContributingContributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.Fork the ProjectCreate your Feature Branch (git checkout -b feature/AmazingFeature)Commit your Changes (git commit -m 'Add some AmazingFeature')Push to the Branch (git push origin feature/AmazingFeature)Open a Pull Request📄 LicenseDistributed under the MIT License. See LICENSE for more information.📞 Contact & SupportDiscount Store BDWebsite: https://discountstorebd.com/Email: support@discountstorebd.comLocation: Dhaka, Bangladesh
