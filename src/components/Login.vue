<template>
  <div class="auth-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input type="text" v-model="username" placeholder="Username" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit" :disabled="isLoading">
        <span v-if="!isLoading">Login</span>
        <div v-if="isLoading" class="spinner"></div>
      </button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}, <button @click="refreshPage">refresh</button></p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../services/auth.js';

const username = ref('');
const password = ref('');
const errorMessage = ref(null);
const successMessage = ref(null);
const isLoading = ref(false);
const { login } = useAuth();

const refreshPage = () => window.location.reload();

const handleLogin = async () => {
  errorMessage.value = null;
  successMessage.value = null;
  isLoading.value = true;
  try {
    await login(username.value, password.value);
    successMessage.value = 'Login successful!';
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.auth-form { text-align: center; }
input { display: block; margin: 10px auto; padding: 8px; width: 90%; }
button { margin-top: 10px; }
.error { color: red; margin-top: 10px; }
.success { color: green; margin-top: 10px; }

input[type="password"], input[type="text"] {
  border: 2px solid #dee2e6;
  border-radius: 12px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input[type="password"]:focus, input[type="text"]:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
}

button {
  padding: 6px 20px;
  font-size: 13px;
  font-weight: 400;
  color: #fff;
  background-color: #FF9800;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0 auto;
  min-height: 31px;
}

button:disabled {
  background-color: #ff9800a6;
  cursor: not-allowed;
}

.spinner {
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top: 3px solid #fff;
  width: 15px;
  height: 15px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>