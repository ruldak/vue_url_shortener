import { ref } from 'vue';
import Cookies from 'js-cookie';
import API from '../api'; // Import instance axios kita

const user = ref(null);

export function useAuth() {
  const isAuthenticated = ref(!!Cookies.get('accessToken'));

  const logout = () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    isAuthenticated.value = false;
    user.value = null;
    // Hapus semua cookie edit_key saat logout
    Object.keys(Cookies.get()).forEach(cookieName => {
      if (cookieName.startsWith('edit_key_')) {
        Cookies.remove(cookieName);
      }
    });
    window.location.reload();
  };

  const register = async (username, email, password) => {
    // Axios akan otomatis melempar error jika response.ok adalah false
    await API.post('/api/auth/register/', { username, email, password });
    // Setelah registrasi berhasil, langsung login
    await login(username, password);
  };

  const login = async (username, password) => {
    const response = await API.post('/api/token/', { username, password });
    const { access, refresh } = response.data;
    Cookies.set('accessToken', access, { secure: true, sameSite: 'strict' });
    Cookies.set('refreshToken', refresh, { secure: true, sameSite: 'strict' });
    isAuthenticated.value = true;
  };

  // NOTE: Logika refresh token perlu diintegrasikan dengan interceptor axios
  // Untuk saat ini, kita sederhanakan dulu. Jika token expired, user akan logout.
  // Interceptor axios bisa di-upgrade untuk menangani refresh token secara otomatis.

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout,
  };
}
