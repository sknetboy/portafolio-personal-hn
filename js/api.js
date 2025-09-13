/**
 * API Client para el Portfolio Backend
 * Maneja todas las llamadas HTTP al servidor backend
 */

class ApiClient {
  constructor(baseURL = null) {
    // Auto-detect environment
    if (!baseURL) {
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        this.baseURL = 'http://localhost:3001/api';
      } else {
        this.baseURL = '/api';
      }
    } else {
      this.baseURL = baseURL;
    }
    this.accessToken = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Realizar petición HTTP con manejo de errores y autenticación
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    // Agregar token de autenticación si está disponible
    if (this.accessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Si el token expiró, intentar renovarlo
      if (response.status === 401 && this.refreshToken) {
        const renewed = await this.renewToken();
        if (renewed) {
          // Reintentar la petición original con el nuevo token
          config.headers.Authorization = `Bearer ${this.accessToken}`;
          return await fetch(url, config);
        }
      }

      return response;
    } catch (error) {
      console.error('Error en petición API:', error);
      throw error;
    }
  }

  /**
   * Renovar token de acceso usando refresh token
   */
  async renewToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.data.accessToken, data.data.refreshToken);
        return true;
      } else {
        this.clearTokens();
        return false;
      }
    } catch (error) {
      console.error('Error renovando token:', error);
      this.clearTokens();
      return false;
    }
  }

  /**
   * Guardar tokens en localStorage
   */
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  /**
   * Limpiar tokens del localStorage
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated() {
    return !!this.accessToken;
  }

  // ==================== PROYECTOS ====================

  /**
   * Obtener todos los proyectos públicos
   */
  async getProjects(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/projects${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request(endpoint);
    return await response.json();
  }

  /**
   * Obtener proyectos destacados
   */
  async getFeaturedProjects() {
    const response = await this.request('/projects/featured');
    return await response.json();
  }

  /**
   * Obtener un proyecto por ID
   */
  async getProject(id) {
    const response = await this.request(`/projects/${id}`);
    return await response.json();
  }

  /**
   * Crear nuevo proyecto (requiere autenticación admin)
   */
  async createProject(projectData) {
    const response = await this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    });
    return await response.json();
  }

  /**
   * Actualizar proyecto (requiere autenticación admin)
   */
  async updateProject(id, projectData) {
    const response = await this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData)
    });
    return await response.json();
  }

  /**
   * Eliminar proyecto (requiere autenticación admin)
   */
  async deleteProject(id) {
    const response = await this.request(`/projects/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  }

  /**
   * Alternar estado destacado de proyecto (requiere autenticación admin)
   */
  async toggleProjectFeatured(id) {
    const response = await this.request(`/projects/${id}/toggle-featured`, {
      method: 'PATCH'
    });
    return await response.json();
  }

  // ==================== CONTACTOS ====================

  /**
   * Enviar mensaje de contacto
   */
  async sendContact(contactData) {
    const response = await this.request('/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
    return await response.json();
  }

  /**
   * Obtener todos los mensajes de contacto (requiere autenticación admin)
   */
  async getContacts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/contacts${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request(endpoint);
    return await response.json();
  }

  /**
   * Obtener un mensaje de contacto por ID (requiere autenticación admin)
   */
  async getContact(id) {
    const response = await this.request(`/contacts/${id}`);
    return await response.json();
  }

  /**
   * Actualizar mensaje de contacto (requiere autenticación admin)
   */
  async updateContact(id, contactData) {
    const response = await this.request(`/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData)
    });
    return await response.json();
  }

  /**
   * Eliminar mensaje de contacto (requiere autenticación admin)
   */
  async deleteContact(id) {
    const response = await this.request(`/contacts/${id}`, {
      method: 'DELETE'
    });
    return await response.json();
  }

  /**
   * Cambiar estado de mensaje de contacto (requiere autenticación admin)
   */
  async updateContactStatus(id, status) {
    const response = await this.request(`/contacts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return await response.json();
  }

  /**
   * Obtener estadísticas de contactos (requiere autenticación admin)
   */
  async getContactStats() {
    const response = await this.request('/contacts/stats/summary');
    return await response.json();
  }

  // ==================== AUTENTICACIÓN ====================

  /**
   * Iniciar sesión
   */
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      this.setTokens(result.data.accessToken, result.data.refreshToken);
    }
    
    return result;
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    return await response.json();
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await this.request('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      this.clearTokens();
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   */
  async getProfile() {
    const response = await this.request('/auth/me');
    return await response.json();
  }

  // ==================== SISTEMA ====================

  /**
   * Verificar estado del sistema
   */
  async getHealth() {
    const response = await this.request('/health');
    return await response.json();
  }
}

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiClient };
}

// Hacer disponible globalmente en el navegador
if (typeof window !== 'undefined') {
  window.api = new ApiClient();
  window.ApiClient = ApiClient;
}