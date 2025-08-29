<template>
  <div class="auth-form">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <input type="text" v-model="username" placeholder="Username" required />
      <input type="email" v-model="email" placeholder="Email" required />
      <input type="password" v-model="password" placeholder="Password" required />
      <button type="submit">Register</button>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success">{{ successMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '../services/auth.js';

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref(null);
const successMessage = ref(null);
const { register } = useAuth();

const handleRegister = async () => {
  errorMessage.value = null;
  try {
    await register(username.value, email.value, password.value);
    successMessage.value = 'Registration successful! You can now log in.';
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