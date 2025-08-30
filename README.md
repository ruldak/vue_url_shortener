# URL Shortener - Vue.js Client

A frontend client built with Vue.js 3 to interact with the URL Shortener REST API.

---

### ⚠️ Important Note

**This project is a case study for building a robust and feature-rich REST API. The main focus is on the backend functionality.**

This user interface (UI) was created as a client to demonstrate the API's capabilities. Therefore, please excuse the simple design and user experience (UI/UX).

➡️ **Check out the Backend Repository here:** [URL_Shortener](https://github.com/ruldak/django_url_shortener_api)

---

## ✨ Features

- **User Authentication:** JWT-based registration and login.
- **Link Management:**
  - Create short links (for both authenticated and anonymous users).
  - View a list of all links created by the user.
  - Edit the title and long URL of existing links.
  - Delete links.
- **Analytics:**
  - View the total number of clicks.
  - View detailed analytics for each link (by country, device, and day).

## 🛠️ Tech Stack

- **Framework:** [Vue.js 3](https://vuejs.org/) (with Composition API)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Simple State Management:** Vue 3 Reactivity (`ref`, `reactive`)
- **Cookie Management:** [js-cookie](https://github.com/js-cookie/js-cookie) for handling authentication tokens.

## 🚀 Local Installation and Setup

To run this project in your local environment, follow these steps:

**1. Clone the Repository**
```bash
git clone https://github.com/ruldak/vue_url_shortener.git your_directory
cd your_directory
```

**2. Install Dependencies**
```bash
npm install
```

**3. Configure Environment Variables**

This project does not require a `.env` file for local setup, as all API requests are proxied. Just make sure your backend API is running.

## ⚙️ Available Scripts

- **Run Development Server**
  - Runs the app in development mode with hot-reloading.
  ```bash
  npm run dev
  ```

- **Build for Production**
  - Compiles and minifies assets for production. The output will be in the `dist/` directory.
  ```bash
  npm run build
  ```

- **Preview Production Build**
  - Runs a local server to preview the production build.
  ```bash
  npm run preview
  ```

## 🌐 Deployment

This project is pre-configured for easy deployment to **Vercel**.

1.  **Push to a Git Repository:** Make sure all your code is pushed to GitHub/GitLab/Bitbucket.

2.  **Import Project in Vercel:** Import your repository into Vercel. It will automatically detect that this is a Vite project and apply the correct settings.

3.  **Configure Environment Variables in Vercel:**
    This is a **CRUCIAL** step. Vercel needs to know where your backend API is located and its secret key.

    Open your project dashboard in Vercel, then go to **Settings → Environment Variables** and add:
    - `VITE_DJANGO_API_URL`: The URL of your Django backend (e.g., `https://your-api.onrender.com`).
    - `DJANGO_API_KEY`: The secret API key used by the proxy to communicate with the backend.

The `vercel.json` configuration in this project will automatically handle proxying all requests from `/api` to your backend, keeping your API key safe and not exposed on the client-side.

## Credits

Favicon used in this project:  
[Link Square SVG Vector](https://www.svgrepo.com/svg/525987/link-square) by Solar Icons
