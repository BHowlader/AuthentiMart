# AuthentiMart - Authentic Products, Authentic Experience

AuthentiMart is a modern e-commerce platform built to provide a premium shopping experience for authentic beauty, skincare, and tech products. It specifically targets the Bangladeshi market with a focus on genuine products and trust.

## 🚀 Features

-   **Modern UI/UX**: A visually stunning, responsive interface with glassmorphism effects and smooth animations.
-   **Dynamic Hero Section**: Interactive sliding hero banner with category-specific themes and accent colors.
-   **Product Catalog**: categorized listing of products including Lip, Eye, Face, Skincare, Men's Grooming, Tech, Home Appliances, and more.
-   **Product Details**: Comprehensive product pages with image galleries, ratings, reviews, and specifications.
-   **Shopping Cart**: Fully functional cart with quantity management and totals calculation.
-   **Wishlist**: Ability for users to save favorite items.
-   **User Authentication**: Login and Registration functionality.
-   **Admin Panel**: Backend administration for managing products and orders.
-   **Search & Filtering**: Easy product discovery.

## 🛠️ Tech Stack

### Frontend
-   **React** (Vite)
-   **CSS3** (Vanilla CSS with modern variables and flexbox/grid)
-   **Lucide React** (Icons)
-   **React Router DOM** (Navigation)

### Backend
-   **Python** (FastAPI)
-   **Uvicorn** (ASGI Server)

## 📦 Installation & Setup

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)

### 1. Clone the Repository
```bash
git clone https://github.com/BHowlader/AuthentiMart.git
cd AuthentiMart
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will start at `http://localhost:5173`

### 3. Backend Setup
```bash
cd backend
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload
```
The backend API will run at `http://localhost:8000`

## 📸 Image Generation Inputs
This project includes prompt files (`HERO_AND_CATEGORY_PROMPTS.md`, `IMAGE_GENERATION_PROMPTS.md`) used to generate high-quality, consistent product assets using AI tools.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
