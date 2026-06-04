import apiClient from 'src/shared/services/api-client';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Método para iniciar sesión
  async login(email: string, password: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/login', { 
        email: email, 
        password: password 
      });
      const { token } = response.data;
      localStorage.setItem('token', token); // Guardar el token en localStorage
      
      // Obtener el perfil del usuario y guardar sus datos
      try {
        const userProfile = await this.getCurrentUser();
        
        // La respuesta puede venir en diferentes formatos
        const user = userProfile.data?.data || userProfile.data || userProfile;
        
        if (user && user.id_usuario) {
          // Guardar datos individuales (compatibilidad)
          localStorage.setItem('userId', user.id_usuario?.toString() || '');
          localStorage.setItem('userName', user.nombre || '');
          localStorage.setItem('userEmail', user.correo || '');
          localStorage.setItem('rol', user.id_rol?.toString() || '0');
          
          // Guardar objeto completo del usuario (para otros componentes)
          localStorage.setItem('auth', JSON.stringify(user));
        }
      } catch (profileError) {
        // Error silencioso
      }
    } catch (error) {
      throw error;
    }
  }

  // Método para registrar un nuevo usuario
  async register(userData: {nombre: string; email: string; password: string; apellido: string; cedula: string; carrera: string; telefono: string; id_rol: number }): Promise<void> {
    try {
      await apiClient.post('/auth/register', {
        nombre: userData.nombre,
        email: userData.email,
        apellido: userData.apellido,
        correo: userData.email,
        password: userData.password, 
        cedula: userData.cedula,
        carrera: userData.carrera,
        telefono: userData.telefono,
        id_rol: userData.id_rol
      });
    } catch (error) {
      throw error;
    }
  }

  // Método para cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario'); // Remover objeto completo del usuario
  }

  // Método para verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Método para obtener el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Método para obtener el perfil del usuario actual
  async getCurrentUser(): Promise<any> {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      // Si falla (token inválido/expirado), hacer logout
      this.logout();
      throw error;
    }
  }
async verify(): Promise<any> {
  try {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  } catch (error) {
    throw error;
  }
}
  

}
