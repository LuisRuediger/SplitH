import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth-service';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [MessageModule, ToastModule, ButtonModule, InputTextModule, ReactiveFormsModule, CheckboxModule, RouterLink],
  providers: [MessageService],
  templateUrl: './user-register.html',
  styleUrl: './user-register.css'
})
export class UserRegister {
  messageService = inject(MessageService);
  private router = inject(Router);
  registerForm: FormGroup;
  formSubmitted: boolean = false;
  isLoading = false;
  showPassword = false;
  private auth = inject(AuthService)

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      terms: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.formSubmitted = true;
    if (this.registerForm.valid) {
      this.isLoading = true;

      setTimeout(() => {
        const { name, email, password } = this.registerForm.value;

        this.auth.register({name, email, password}).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Conta criada!',
              detail: 'Sua conta foi criada com sucesso',
              life: 3000
            })
            setTimeout(() => this.router.navigate(['/login']), 1500);
          },
          error: (err) => {
            if (err.status === 409) {
              this.messageService.add({
                severity: 'error',
                summary: `O email ${email} já está cadastrado!`,
                detail: 'Tente usar um email diferente.',
                life: 3000
              })
            }

            console.log("Error:", err.error)
          }
        })

        this.isLoading = false;
      }, 2000)
    }
  }

  isInvalid(controlName: string) {
    const control = this.registerForm.get(controlName);
    return control?.invalid && (control.touched || this.formSubmitted);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
}