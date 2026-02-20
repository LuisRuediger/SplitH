import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { Router, RouterLink } from '@angular/router';

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

    constructor(private fb: FormBuilder) {
      this.registerForm = this.fb.group({
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        terms: ['', [Validators.required]],
      }, { validators: this.passwordMatchValidator});
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
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
            this.registerForm.reset();
            this.formSubmitted = false;
            this.isLoading = false;

            this.router.navigate(['/dashboard']);
          }, 2000)
        }
    }

    isInvalid(controlName: string) {
        const control = this.registerForm.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }
}