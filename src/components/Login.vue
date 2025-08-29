<template>
  <div class="auth-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <input type="text" v-model="username" placeholder="Username" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Login</button>
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
const { login } = useAuth();

const refreshPage = () => window.location.reload();

const handleLogin = async () => {
  errorMessage.value = null;
  successMessage.value = null;
  try {
    await login(username.value, password.value);
    successMessage.value = 'Login successful!';
  } catch (err) {
    errorMessage.value = err.message;
  }
};
</script>

<style scoped>
.auth-form { text-align: center; }
input { display: block; margin: 10px auto; padding: 8px; width: 90%; }
button { margin-top: 10px; }
.error { color: red; margin-top: 10px; }
.success { color: green; margin-top: 10px; }
</style>