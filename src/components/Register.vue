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
.error { color: red; margin-top: 10px; }
.success { color: green; margin-top: 10px; }

input[type="password"], input[type="text"], input[type="email"] {
  border: 2px solid #dee2e6;
  border-radius: 12px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input[type="password"]:focus, input[type="text"]:focus, input[type="email"]:focus {
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
  margin: 10px auto 0 auto;
}
</style>