# FitAI – AI-Powered Home Fitness Tracker

<div align="center">
  <h3>Your personal AI fitness coach that watches, corrects, and motivates you — all in real time.</h3>
</div>

<br/>

## ✨ Features

- **Real-time Pose Detection & Form Correction**  
  Uses your webcam to analyze body posture during workouts and gives instant feedback ("Straighten your back!", "Lower your hips!", etc.).

- **AI-Generated Personalized Workout Plans**  
  Powered by Gemini, creates custom weekly plans based on your fitness goal, experience level, available equipment, and schedule.

- **Smart Diet & Meal Planner**  
  Generates daily meal suggestions tailored to your goal (weight loss, muscle gain, maintenance) and dietary preferences (vegetarian, vegan, keto, etc.).

- **Progress Tracking with Beautiful Charts**  
  Visualizes your weekly performance (total reps, calories burned, streak) with interactive line charts.

- **Dark/Light Mode + Fully Responsive**  
  Works perfectly on phones, tablets, and desktops.

- **No gym required**  
  100% bodyweight and minimal-equipment friendly.

- **Motivational Quotes & Gamification**  
  Keeps you inspired every session.

<br/>

## 🚀 Live Demo

Try it now: https://ai-fitness-app-sigma.vercel.app/

<br/>

## 🛠 Tech Stack

- **React 19** + TypeScript
- **Vite** – blazing fast development
- **Tailwind CSS** – modern styling
- **React Router** – smooth page transitions
- **Recharts** – beautiful progress graphs
- **Google Gemini API** – AI workout & diet generation
- **Webcam-based Pose Estimation** – real-time form feedback
- **HashRouter** – works perfectly when deployed on static hosts (GitHub Pages, Vercel, Netlify, etc.)

<br/>

## ⚙️ Local Setup (5 minutes)

### Prerequisites
- Node.js ≥ 18
- A free Gemini API key → [https://ai.google.dev](https://ai.google.dev)

### Steps

1. **Clone or download this repository**
   ```bash
   git clone https://github.com/yourusername/fitai.git
   cd fitai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your Gemini API key**
   Create a file called `.env.local` in the root folder:
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Run the app locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production (optional)**
   ```bash
   npm run build
   npm run preview
   ```

<br/>

## 📱 Pages Overview

| Route        | Page               | What it does                                      |
|-------------|--------------------|----------------------------------------------------|
| `/`         | Home               | Welcome screen, motivational quote, quick stats   |
| `/workout`  | Live Workout       | Real-time pose detection + rep counting           |
| `/plan`     | Plan Generator     | AI creates your custom weekly workout plan        |
| `/diet`     | Diet Planner       | AI generates daily meals based on your goals      |
| `/progress` | Progress Dashboard | Charts, stats, and weekly performance             |
| `/settings` | Settings           | Theme toggle, clear data, etc.                    |

<br/>

## 🎯 Example AI Prompts Used (behind the scenes)

- Workout Plan:  
  `"Create a 4-week beginner bodyweight workout plan for weight loss, 4 days/week, 30–40 min sessions..."`

- Diet Plan:  
  `"Give me a 2000 kcal vegetarian weight-loss meal plan for one day with breakfast, lunch, dinner and 2 snacks..."`

<br/>

## 🚀 Deploy Anywhere (Zero Config)

Works out-of-the-box on:

- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- Render
- Firebase Hosting

Just connect your repo and deploy — Vite + HashRouter handles everything.

<br/>

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Open issues for bugs or feature requests
- Submit pull requests (new exercises, better pose detection, UI improvements, etc.)
- Add translations

<br/>

## 📄 License

MIT © 2025 FitAI – Free to use, modify, and distribute.

<br/>

<div align="center">
  <p>Made with ❤️ and a lot of sweat</p>
  <sub>Now go crush that workout! 💪</sub>
</div>
