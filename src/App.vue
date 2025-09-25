<template>
  <div id="app-layout">
    <header>
      <nav>
        <h1>URL Shortener</h1>
        <div v-if="isAuthenticated">
          <button @click="handleLogout" class="logout-button">Logout</button>
        </div>
      </nav>
    </header>

    <main>
      <div v-if="!isAuthenticated" class="auth-container">
        <div class="auth-toggle">
          <button :class="{ active: !showRegister }" @click="showRegister = false">Login</button>
          <button :class="{ active: showRegister }" @click="showRegister = true">Register</button>
        </div>
        <Login v-if="!showRegister" />
        <Register v-else />
      </div>

      <URLShortener />
    </main>
    <footer>
      <p>Made with ❤️ by <a href="https://github.com/ruldak" target="_blank">Hari Cahyono</a> - <a href="https://github.com/ruldak/vue_url_shortener" target="_blank">See the repository</a></p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuth } from './services/auth.js';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import URLShortener from './components/URLShortener.vue';

const { isAuthenticated, logout } = useAuth();
const showRegister = ref(false);

const handleLogout = () => {
  logout();
}
</script>

<style>
body {
  background-color: #f0f2f5;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
#app-layout header {
  background: #fff;
  color: #333;
  padding: 10px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
#app-layout nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
}
.logout-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
main {
  max-width: 900px;
  margin: 20px auto;
  padding: 0 20px;
}
.auth-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}
.auth-toggle {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  border-radius: 6px;
  overflow: hidden;
}
.auth-toggle button {
  flex: 1;
  padding: 10px 20px;
  border: none;
  background: #f0f0f0;
  cursor: pointer;
  font-size: 16px;
}
.auth-toggle button.active {
  background: #FF9800;
  color: white;
  font-weight: 600;
}

footer {
  width: fit-content;
  margin: 0 auto 0 auto;
}
</style>