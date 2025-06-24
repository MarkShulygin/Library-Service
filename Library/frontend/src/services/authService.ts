import api, { getUserProfile } from './api';
import { jwtDecode } from 'jwt-decode';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin'; // нижній регістр для відповідності бекенду
  secretKey?: string;
}

export interface AuthResponse {
  token?: string;
  access_token?: string;
  token_type?: string;
}

export interface UserData {
  id?: string;
  email: string;
  name: string;
  role: string;
}

class AuthService {
  private tokenKey = 'auth_token';
  private userKey = 'user_data';
  
  constructor() {
    // Викликаємо міграцію при ініціалізації сервісу
    this.migrateUserIdToUUID();
  }
  
  /**
   * Міграція старого формату ID користувача на UUID
   * Цей метод перевіряє, чи поточний ID у локальному сховищі відповідає формату UUID
   * Якщо ні, то генерує новий UUID і замінює старий ID
   */
  private migrateUserIdToUUID(): void {
    try {
      const currentUserId = localStorage.getItem('user_id');
      
      if (currentUserId) {
        const isValidUUID = (str: string) => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(str);
        };
        
        // Якщо ID не валідний UUID, створюємо новий
        if (!isValidUUID(currentUserId)) {
          console.log('Міграція: знайдено старий формат ID, генеруємо новий UUID');
          const newUUID = crypto.randomUUID();
          localStorage.setItem('user_id', newUUID);
          console.log('Міграція: ID оновлено');
          
          // Якщо є дані користувача, оновлюємо також їх
          const userDataStr = localStorage.getItem(this.userKey);
          if (userDataStr) {
            try {
              const userData = JSON.parse(userDataStr);
              userData.id = newUUID;
              localStorage.setItem(this.userKey, JSON.stringify(userData));
              console.log('Міграція: дані користувача оновлено');
            } catch (e) {
              console.error('Міграція: помилка оновлення даних користувача', e);
            }
          }
        }
      }
    } catch (e) {
      console.error('Помилка міграції ID користувача:', e);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/users/login', credentials);
      const token = response.data.access_token || response.data.token;
      if (token) {
        this.setToken(token);
        let userData = this.parseUserDataFromToken(token);
        try {
          const profileData = await getUserProfile();
          if (profileData && profileData.name) {
            userData = { ...userData, name: profileData.name };
          }
        } catch (profileError) {
          console.warn('Could not fetch user profile:', profileError);
        }
        this.setUser(userData);
        return { token };
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { secretKey, ...userData } = credentials;
      const response = await api.post('/users/register', {
        ...userData,
        role: userData.role || 'user',
      });
      const token = response.data.access_token || response.data.token;
      if (token) {
        this.setToken(token);
        let userDataFromToken = this.parseUserDataFromToken(token);
        try {
          const profileData = await getUserProfile();
          if (profileData && profileData.name) {
            userDataFromToken = { ...userDataFromToken, name: profileData.name };
          } else {
            userDataFromToken.name = credentials.name;
          }
        } catch (profileError) {
          userDataFromToken.name = credentials.name;
        }
        this.setUser(userDataFromToken);
        return { token };
      }
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        await api.post('/users/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Видаляємо тільки авторизаційні дані, а не весь localStorage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem('user_id');

      // Очищаємо всі ключі прогресу читання
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('reading_progress_')) {
          localStorage.removeItem(key);
        }
      });

      api.defaults.headers.common['Authorization'] = '';
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decodedToken: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decodedToken.exp > currentTime;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUser(user: UserData): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  getUser(): UserData | null {
    try {
      const userStr = localStorage.getItem(this.userKey);
      if (!userStr) {
        const token = this.getToken();
        if (token) {
          const userData = this.parseUserDataFromToken(token);
          this.setUser(userData);
          return userData;
        }
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  private parseUserDataFromToken(token: string): UserData {
    try {
      const decoded: any = jwtDecode(token);
      
      // Додаємо дебаг-інформацію для перевірки вмісту токена
      console.log('Decoded token:', decoded);
      
      // Отримуємо ID користувача - використовуємо реальний ID, не email
      let userId = decoded.id || decoded.userId;
      const userEmail = decoded.sub || decoded.email;
      
      // Функція для перевірки, чи рядок є валідним UUID
      const isValidUUID = (str: string) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(str);
      };
      
      // Якщо ID відсутній або не є валідним UUID, генеруємо новий UUID
      if (!userId || (typeof userId === 'string' && !isValidUUID(userId))) {
        // Використовуємо crypto.randomUUID() для генерації стандартного UUID
        userId = crypto.randomUUID();
      }
      
      // Переконуємось, що ID є рядком
      const effectiveUserId = String(userId);
      
      // Отримуємо ім'я користувача з токена
      // Спробуємо різні можливі поля для імені
      const userName = decoded.name || decoded.username || decoded.fullName || 
                   decoded.firstName || decoded.preferred_username;
      
      // Формуємо об'єкт користувача
      const userData = {
        id: effectiveUserId,
        email: userEmail,
        role: decoded.role?.replace('ROLE_', '') || 'USER',
        name: userName || (userEmail ? userEmail.split('@')[0] : 'User')
      };
      
      console.log('Generated user data:', userData);
      
      // Зберігаємо user_id в localStorage для використання в ReadingService
      // Завжди зберігаємо ID, а не email
      localStorage.setItem('user_id', effectiveUserId);
      
      return userData;
    } catch (error) {
      console.error('Error parsing token:', error);
      throw new Error('Invalid token format');
    }
  }
}

const authService = new AuthService();
export default authService;
