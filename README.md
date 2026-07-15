# 📄 DocQuery
> **Your intelligent workspace for secure PDF document analysis and AI-powered chat.**

**Live Demo → https://doc-query-phi.vercel.app/**

## Home Page
<img width="1877" height="897" alt="image" src="https://github.com/user-attachments/assets/15aa779d-b4c5-484e-be7a-921a1991c783" />


## Dashboard Page
<img width="1880" height="851" alt="image" src="https://github.com/user-attachments/assets/5d0475b3-7c49-4456-be79-5e49d2322a0e" />


## Chat Page
<img width="1876" height="890" alt="image" src="https://github.com/user-attachments/assets/634dd8d1-42c8-4be9-86b8-20f301cb21b5" />


---

## 🚀 Features
*   **⚡ Instant Extraction**: Upload any PDF and extract content in seconds using our custom pipeline.[cite: 1]
*   **🧠 AI-Powered Chat**: Ask complex questions and get precise answers derived directly from your documents.[cite: 1]
*   **🔒 Secure & Private**: Your files are stored securely and strictly isolated per user session.[cite: 1]
*   **📊 Unified Dashboard**: Manage and navigate through all your uploaded documents in one beautiful workspace.[cite: 1]

---

## 🛠 Tech Stack
*   **Framework**: `Next.js 15 (App Router)`
*   **Language**: `TypeScript` (Strict Mode)
*   **Database**: `MongoDB` & `Prisma`
*   **Auth**: `Clerk`
*   **Storage**: `UploadThing`
*   **Styling**: `Tailwind CSS`
*   **Deployment**: `Vercel`

---

## 💻 Quick Start

**1. Clone the repo**
```bash```
git clone [https://github.com/pandeyharsh9356/DocQuery](https://github.com/pandeyharsh9356/DocQuery)

**2. Install dependencies**
npm install

**3. Setup environment variables**
cp .env.example .env 
Add your Clerk, Database, and UploadThing keys here

**4. Push schema to database**
npx prisma db push

**5. Run the magic!**
npm run dev

## 🏗 Architecture 
**DocQuery follows a clean, scalable server-side rendering architecture.**  
**Authentication:** Managed via Clerk to ensure enterprise-grade security.  
**File Management:** UploadThing handles secure file uploads with strict MIME-type allow-listing.  
**Database Layer:** Prisma connects to a managed Postgres instance for high availability.  

## 👨‍💻 Developer
Harsh Pandey

B.Sc Information Technology Student
Mumbai, India

📧 Email: pandeyharsh9356@gmail.com

🐙 GitHub: https://github.com/pandeyharsh9356

💼 LinkedIn: https://linkedin.com/in/harsh-pandey-9162913a7

## ⭐ Support
If you found this project useful, please consider giving it a star ⭐ on GitHub.

Made with ❤️ by Harsh Pandey
