# 🚀 TRIP IT! - Your AI-Powered Travel Planner

Tired of endless travel planning? **TRIP IT!** is a sleek, modern web application that uses the power of Google's Gemini AI to instantly generate personalized travel itineraries. Just enter your destination, trip duration, and interests, and let the AI craft your next perfect adventure!


### ✨ Features

* **AI-Powered Itinerary Generation:** Leverages Google's `gemini-1.5-flash` model for fast and intelligent travel planning.
* **Interactive Map View:** See all your suggested locations pinned on a beautiful, responsive map.
* **Day-by-Day Breakdown:** Get a clean, organized, and collapsible timeline of your trip.
* **Sleek & Modern UI:** A stunning, responsive interface that looks great on desktop, tablet, and mobile.
* **Secure Backend:** Protects the developer's API key by handling all AI calls through a secure Vercel Serverless Function.

### 💻 Tech Stack

* **Frontend:**
    * [**React**](https://reactjs.org/) (with Vite)
    * [**React-Bootstrap**](https://react-bootstrap.github.io/) for UI components
    * [**React-Leaflet**](https://react-leaflet.js.org/) for interactive maps
* **Backend:**
    * [**Node.js**](https://nodejs.org/)
    * [**Vercel Serverless Functions**](https://vercel.com/docs/functions) for a secure, scalable API proxy.
* **AI:**
    * [**Google Gemini API**](https://ai.google.dev/)

### 🛠️ Local Development Setup

To get this project running on your local machine, follow these steps.

**1. Clone the Repository**

```bash
git clone [https://github.com/YourUsername/your-repo-name.git](https://github.com/YourUsername/your-repo-name.git)
cd your-repo-name
```

**2. Install Frontend Dependencies**

```bash
npm install
```

**3. Set Up the Backend Environment**

The backend is a Vercel Serverless Function that runs locally using the Vercel CLI.

  * Install the Vercel CLI globally:
    ```bash
    npm i -g vercel
    ```
  * Create a `.env.local` file in the root of your project. This file is for your *local* secret key and will be ignored by Git.
  * Add your Gemini API key to this file:
    ```
    # .env.local
    GEMINI_API_KEY=YOUR_SECRET_GEMINI_API_KEY_GOES_HERE
    ```

**4. Run the Development Server**

Use the Vercel CLI to run both the frontend and the backend function together.

```bash
vercel dev
```

Your application should now be running on `http://localhost:3000`.

### 🌍 Deployment with Vercel

This project is optimized for a seamless deployment with Vercel.

1.  **Push to GitHub:** Make sure your latest code is pushed to your GitHub repository.
2.  **Import Project on Vercel:**
      * Log in to your Vercel account.
      * Click "Add New..." -\> "Project".
      * Select your GitHub repository. Vercel will automatically detect that it's a Vite project.
3.  **Configure Environment Variables:**
      * In the project settings on Vercel, navigate to the "Environment Variables" section.
      * Create a new variable:
          * **Name:** `GEMINI_API_KEY`
          * **Value:** `YOUR_SECRET_GEMINI_API_KEY_GOES_HERE`
4.  **Deploy:**
      * Click the "Deploy" button. Vercel will build your React app and deploy your `api/generate.js` file as a serverless function. Your site will be live in minutes\!

### License

This project uses a MIT License. Visit `LICENCE.md` for more info

