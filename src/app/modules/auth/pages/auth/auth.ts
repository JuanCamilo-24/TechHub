import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from '../../../../shared/services/alert.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  styleUrls: ['./auth.css'],
  standalone: false
})
export class Auth {
  mostrarLogin = true;
  loginForm: FormGroup;
  registerForm: FormGroup;
  mostrarPassword = false;
  mostrarPasswordConfirm = false;
  cargando = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]] //Retiro (.minLength)
    });

    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      cedula: ['', [Validators.required, Validators.minLength(6)]],
      telefono: ['', [Validators.required, Validators.minLength(10)]],
      carrera: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  cambiarFormulario() {
    this.mostrarLogin = !this.mostrarLogin;
    this.loginForm.reset();
    this.registerForm.reset();
    this.mostrarPassword = false;
    this.mostrarPasswordConfirm = false;
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  togglePasswordConfirm() {
    this.mostrarPasswordConfirm = !this.mostrarPasswordConfirm;
  }

  /**
   * ✅ MÉTODO MEJORADO DE LOGIN CON VALIDACIONES ADICIONALES
   * Valida email, contraseña y conecta con el backend
   */
  async iniciarSesion() {
    if (this.loginForm.invalid) {
      this.marcarCamposComoTocados(this.loginForm);
      this.alertService.warning('Formulario incompleto', 'Por favor completa todos los campos correctamente');
      return;
    }

    const email = this.loginForm.get('email')?.value as string | undefined;
    if (!email || !email.includes('@')) {
      this.alertService.error('Email inválido', 'Por favor ingresa un email válido');
      return;
    }

    const password = this.loginForm.get('password')?.value as string | undefined;
    if (!password || password.length < 6) {
      this.alertService.error('Contraseña inválida', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    this.cargando = true;

    try {
      await this.authService.login(email, password);
      this.alertService.success('¡Bienvenido a TechHub!', 'Inicio de sesión exitoso');
      this.router.navigate(['/home']);
    } catch (error: any) {
      const mensajeError = error?.response?.data?.message ||
                           error?.message ||
                           'Credenciales incorrectas o servidor no disponible';
      this.alertService.error('Error en inicio de sesión', mensajeError);
    } finally {
      this.cargando = false;
    }
  }

  async registrar() {
    if (this.registerForm.invalid) {
      this.marcarCamposComoTocados(this.registerForm);
      this.alertService.warning('Formulario incompleto', 'Por favor completa todos los campos correctamente');
      return;
    }

    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.alertService.error('Error', 'Las contraseñas no coinciden');
      return;
    }

    this.cargando = true;

    try {
      const {nombre, apellido, cedula, telefono, carrera, email, password } = this.registerForm.value;
      await this.authService.register({
        nombre,
        apellido,
        email,
        password,
        cedula,
        telefono,
        carrera,
        id_rol: 2 // Rol predeterminado para nuevos usuarios
      });
      
      // Iniciar sesión automáticamente después del registro
      await this.authService.login(email, password);
      
      this.alertService.success('¡Cuenta creada!', 'Registro exitoso. Bienvenido a TechHub');
      this.router.navigate(['/home']);
    } catch (error) {
      this.alertService.error('Error', 'No se pudo completar el registro');
    } finally {
      this.cargando = false;
    }
  }

  private marcarCamposComoTocados(form: FormGroup) {
    Object.keys(form.controls).forEach(key => {
      form.get(key)?.markAsTouched();
    });
  }

  getErrorMessage(formName: 'login' | 'register', fieldName: string): string {
    const form = formName === 'login' ? this.loginForm : this.registerForm;
    const field = form.get(fieldName);

    if (!field || !field.touched) return '';

    if (field.hasError('required')) return 'Este campo es obligatorio';
    if (field.hasError('email')) return 'Email inválido';
    if (field.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    return '';
  }

  hasError(formName: 'login' | 'register', fieldName: string): boolean {
    const form = formName === 'login' ? this.loginForm : this.registerForm;
    const field = form.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }
}
