<template>
  <div class="url-shortener">
    <h1>URL Shortener</h1>
    <p class="subtitle">
      {{ isAuthenticated ? 'Create and manage your links.' : 'Create an anonymous link.' }}
    </p>

    <div class="api-focus-note">
      <p>
        <strong>Note:</strong> This frontend is a client for a REST API.
        The project's main focus is on the backend functionality, so please excuse the simple UI.
      </p>
    </div>
    <form @submit.prevent="createShortUrl" class="url-form">
      <div class="form-group">
        <input
          type="text"
          v-model="title"
          placeholder="Optional Title (e.g., My Website Link)"
          :disabled="loading"
          class="title-input"
        />
        <input
          type="url"
          v-model="longUrl"
          placeholder="Enter your long URL here (e.g., https://...)"
          required
          :disabled="loading"
        />
        <button type="submit" :disabled="loading">
          <span v-if="!loading">Shorten</span>
          <span v-else class="loader"></span>
        </button>
      </div>
      <p v-if="createErrorMessage" class="error">{{ createErrorMessage }}</p>
      <p v-if="createSuccessMessage" class="success">{{ createSuccessMessage }}</p>
    </form>

    <div v-if="loadingLinks" class="feedback-section">
      <p>Loading your links...</p>
    </div>

    <div v-if="fetchErrorMessage" class="feedback-section error-message">
      <p><strong>Error fetching links:</strong> {{ fetchErrorMessage }}</p>
    </div>

    <div v-if="userLinks.length > 0 && !loadingLinks" class="links-list">
      <h3>{{ isAuthenticated ? 'Your Links' : 'Links created in this session' }}</h3>
      <ul>
        <li v-for="link in userLinks" :key="link.short_code">
          <div class="link-info">
            <span v-if="link.title" class="link-title">{{ link.title }}</span>
            <a :href="link.short_url" target="_blank">{{ link.short_url }}</a>
            <span class="long-url">{{ link.long_url }}</span>
          </div>
          <div class="link-actions">
            <button @click="openEditModal(link)" v-if="link.created_by" class="action-button edit-button">Edit</button>
            <button @click="deleteLink(link.short_code)" v-if="link.created_by" class="action-button delete-button">Delete</button>
            <button @click="openAnalyticsModal(link.short_code)" class="action-button analytics-button">Analytics</button>
          </div>
        </li>
      </ul>
    </div>

    <div v-if="!loadingLinks && userLinks.length === 0 && isAuthenticated" class="feedback-section">
      <p>You don't have any links yet. Create one!</p>
    </div>
    <div v-if="!loadingLinks && userLinks.length === 0 && !isAuthenticated" class="feedback-section">
      <p>No links created in this anonymous session yet.</p>
    </div>

    <div v-if="isEditModalVisible" class="modal-overlay">
      <div class="modal-content">
        <h2>Edit Link</h2>
        <form @submit.prevent="handleUpdateLink">
          <label for="edit-title">Title:</label>
          <input id="edit-title" type="text" v-model="editingLinkData.title" placeholder="Optional Title" />

          <label for="edit-long-url">New Long URL:</label>
          <input id="edit-long-url" type="url" v-model="editingLinkData.long_url" required />
          <div class="modal-actions">
            <button type="button" @click="isEditModalVisible = false" class="cancel-button">Cancel</button>
            <button type="submit" :disabled="isUpdating">
              <span v-if="!isUpdating">Save Changes</span>
              <span v-else class="loader"></span>
            </button>
          </div>
          <p v-if="updateError" class="error">{{ updateError }}</p>
        </form>
      </div>
    </div>

    <div v-if="isAnalyticsModalVisible" class="modal-overlay">
      <div class="modal-content">
        <h2>Link Analytics</h2>
        <div v-if="loadingAnalytics" class="loader-container">
          <div class="loader"></div>
          <p>Loading analytics...</p>
        </div>
        <div v-if="analyticsError" class="error">
          <p>{{ analyticsError }}</p>
        </div>
        <div v-if="analyticsData">
          <p class="total-clicks"><strong>Total Clicks:</strong> {{ analyticsData.click_count }}</p>
          <h3>Clicks by Country</h3>
          <ul>
            <li v-for="country in analyticsData.clicks_by_country" :key="country.country">
              {{ country.country }}: {{ country.count }}
            </li>
          </ul>
          <h3>Clicks by Device</h3>
          <ul>
            <li v-for="device in analyticsData.clicks_by_device" :key="device.device_type">
              {{ device.device_type }}: {{ device.count }}
            </li>
          </ul>
          <h3>Clicks by Day</h3>
          <ul>
            <li v-for="day in analyticsData.clicks_by_day" :key="day.date">
              {{ day.date }}: {{ day.count }}
            </li>
          </ul>
        </div>
        <div class="modal-actions">
          <button type="button" @click="isAnalyticsModalVisible = false" class="cancel-button">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import API from '../api';
import { useAuth } from '../services/auth.js';

const { isAuthenticated } = useAuth();
const longUrl = ref('');
const title = ref('');
const userLinks = ref([]);
const loading = ref(false);
const createErrorMessage = ref(null);
const createSuccessMessage = ref(null);

const loadingLinks = ref(false);
const fetchErrorMessage = ref(null);

const isEditModalVisible = ref(false);
const editingLinkData = ref(null);
const isUpdating = ref(false);
const updateError = ref(null);

const isAnalyticsModalVisible = ref(false);
const analyticsData = ref(null);
const loadingAnalytics = ref(false);
const analyticsError = ref(null);



const createShortUrl = async () => {
  loading.value = true;
  createErrorMessage.value = null;
  createSuccessMessage.value = null;

  try {
    const response = await API.post('/api/links/', {
      long_url: longUrl.value,
      title: title.value,
    });

    const data = response.data;

    console.log("res:", data);
    console.log("DEBUG userLinks:", userLinks.value);
    userLinks.value.unshift(data);
    longUrl.value = '';
    title.value = '';
    createSuccessMessage.value = 'Link created successfully!';
  } catch (err) {
    createErrorMessage.value = err.response?.data?.long_url?.[0] || err.response?.data?.title?.[0] || err.response?.data?.detail || err.message;
  } finally {
    loading.value = false;
  }
};

const fetchUserLinks = async () => {
  if (!isAuthenticated.value) {
    userLinks.value = [];
    fetchErrorMessage.value = null;
    loadingLinks.value = false;
    return;
  }

  loadingLinks.value = true;
  fetchErrorMessage.value = null;
  try {
    const response = await API.get('/api/links/');
    console.log(response.data)
    userLinks.value = response.data;
  } catch (err) {
    fetchErrorMessage.value = err.response?.data?.detail || err.message;
  } finally {
    loadingLinks.value = false;
  }
};

const deleteLink = async (shortCode) => {
  if (!confirm('Are you sure you want to delete this link?')) return;

  try {
    await API.delete(`/api/links/${shortCode}/`);

    userLinks.value = userLinks.value.filter(l => l.short_code !== shortCode);
    alert('Link deleted successfully!');

  } catch (err) {
    alert(`Error: ${err.response?.data?.detail || err.message}`);
  }
};

const openAnalyticsModal = async (shortCode) => {
  analyticsData.value = null;
  analyticsError.value = null;
  loadingAnalytics.value = true;
  isAnalyticsModalVisible.value = true;

  try {
    const response = await API.get(`/api/links/${shortCode}/analytics/`);
    analyticsData.value = response.data;
  } catch (err) {
    analyticsError.value = err.response?.data?.detail || err.message;
  } finally {
    loadingAnalytics.value = false;
  }
};

const openEditModal = (link) => {
  editingLinkData.value = { ...link };
  updateError.value = null;
  isEditModalVisible.value = true;
};

const handleUpdateLink = async () => {
  if (!editingLinkData.value) return;

  isUpdating.value = true;
  updateError.value = null;
  try {
    const { short_code, long_url, title } = editingLinkData.value;

    const response = await API.put(`/api/links/${short_code}/`, {
      long_url, title
    });

    const data = response.data;
    const index = userLinks.value.findIndex(l => l.short_code === short_code);
    if (index !== -1) {
      userLinks.value[index] = data;
    }

    isEditModalVisible.value = false;
  } catch (err) {
    updateError.value = err.response?.data?.detail || err.message;
  } finally {
    isUpdating.value = false;
  }
};

onMounted(() => {
  fetchUserLinks();
});

watch(isAuthenticated, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    fetchUserLinks();
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
.url-shortener {
  max-width: 700px;
  margin: 40px auto;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  text-align: center;
}
h1 {
  color: #343a40;
  font-weight: 800;
  font-size: 36px;
  margin-bottom: 15px;
}
.subtitle {
  color: #6c757d;
  margin-bottom: 30px;
  font-size: 20px;
}
.url-form .form-group {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.url-form input[type="url"], .url-form input[type="text"] {
  flex-grow: 1;
  padding: 16px 22px;
  font-size: 18px;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  transition: border-color 0.3s, box-shadow 0.3s;
  width: 520px;
}

.url-form input[type="url"]:focus, .url-form input[type="text"]:focus {
  outline: none;
  border-color: #FF9800;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.1);
}

.url-form button {
  padding: 16px 30px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  background-color: #FF9800;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s, box-shadow 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 130px;
}

.url-form button:hover {
  background-color: #c27402;
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
}

.url-form button:disabled {
  background-color: #a0c7ff;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.feedback-section {
  margin-top: 35px;
  padding: 25px;
  border-radius: 15px;
  background-color: #f8f9fa;
  font-size: 18px;
  color: #495057;
  font-weight: 500;
}
.error {
  color: #dc3545;
  margin-top: 15px;
  font-weight: 600;
  font-size: 16px;
}
.success {
  color: #28a745;
  margin-top: 15px;
  font-weight: 600;
  font-size: 16px;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  padding: 25px;
  border-radius: 15px;
  font-weight: 500;
}

.links-list {
  margin-top: 40px;
  text-align: left;
}
.links-list h3 {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
  font-size: 20px;
  font-weight: 800;
}
.links-list ul {
  list-style: none;
  padding: 0;
  margin-top: 25px;
}
.links-list li {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding: 25px;
  background: #ffffff;
  border-radius: 15px;
  margin-bottom: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.links-list li:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
@media (min-width: 500px) {
  .links-list li {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
  }
}

@media (max-width: 425px) {
  .url-form input[type="url"], .url-form input[type="text"] {
    width: 200px;
  }
  .action-button {
    padding: 6px 10px;
    font-weight: 300;
    font-size: .6rem;
  }
}

.link-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-grow: 1;
  min-width: 0;
  gap: 5px;
}
.link-info .link-title {
  font-weight: 700;
  color: #343a40;
  font-size: 15px;
  margin-bottom: 5px;
  word-break: break-all;
  overflow-wrap: break-word;
}
.link-info a {
  font-size: 17px;
  font-weight: 700;
  color: #007bff;
  text-decoration: none;
  word-break: break-all;
  overflow-wrap: break-word;
  transition: color 0.3s;
}
.link-info a:hover {
  text-decoration: underline;
  color: #0056b3;
}
.link-info .long-url {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
  word-break: break-all;
  overflow-wrap: break-word;
}
.link-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}
@media (min-width: 500px) {
  .link-actions {
    margin-top: 0;
    gap: 12px;
  }
}

.action-button {
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s, transform 0.2s;
}

.action-button:hover {
  transform: translateY(-2px);
}
.edit-button {
  background-color: #ffc107;
  color: #212529;
}

.edit-button:hover {
  background-color: #e0a800;
}
.delete-button {
  background-color: #dc3545;
  color: white;
}

.delete-button:hover {
  background-color: #c82333;
}

.analytics-button {
  background-color: #17a2b8;
  color: white;
}

.analytics-button:hover {
  background-color: #138496;
}

/* Gaya untuk Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(8px);
}
.modal-content {
  background: #ffffff;
  padding: 40px;
  border-radius: 20px;
  width: 90%;
  height: 85%;
  max-width: 600px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
  overflow: auto;
  scrollbar-color: gray transparent;
  scrollbar-width: thin;
}
.modal-content h2 {
  margin-top: 0;
  margin-bottom: 30px;
  color: #2c3e50;
  font-weight: 800;
  text-align: center;
  font-size: 28px;
  letter-spacing: 0.5px;
}
.modal-content label {
  display: block;
  margin-bottom: 10px;
  font-weight: 700;
  color: #34495e;
  font-size: 16px;
}
.modal-content input {
  width: 100%;
  padding: 15px;
  margin-bottom: 20px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}
.modal-content input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15);
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 25px;
}

.modal-actions button {
  padding: 12px 25px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  transition: background-color 0.3s, transform 0.2s;
}

.modal-actions button:hover {
  transform: translateY(-2px);
}

.modal-actions .cancel-button {
  background-color: #6c757d;
  color: white;
  transition: background-color 0.3s, transform 0.2s;
}

.modal-actions .cancel-button:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.modal-content h3 {
  margin-top: 30px;
  margin-bottom: 20px;
  color: #34495e;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
  font-size: 20px;
  font-weight: 700;
}
.modal-content ul {
  list-style: none;
  padding: 0;
  margin-bottom: 30px;
}
.modal-content li {
  background-color: #f8f9fa;
  padding: 15px 20px;
  border-radius: 10px;
  margin-bottom: 12px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.3s, transform 0.2s;
}

.modal-content li:hover {
  background-color: #e9ecef;
  transform: scale(1.02);
}

.total-clicks {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 25px;
}

.total-clicks strong {
  font-weight: 800;
  color: #007bff;
  font-size: 20px;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
}

.loader-container p {
  margin-top: 15px;
  font-size: 18px;
  color: #555;
  font-weight: 500;
}

/* Loader animation */
.loader {
  width: 22px;
  height: 22px;
  border: 3px solid #007bff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

.api-focus-note {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 15px;
  margin: 25px 0;
  text-align: center;
  font-size: 15px;
  color: #8a6d3b;
}
.api-focus-note p {
  margin: 0;
}
.api-focus-note strong {
  color: #66512c;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>