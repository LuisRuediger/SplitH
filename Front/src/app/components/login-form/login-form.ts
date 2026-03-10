import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { Checkbox } from 'primeng/checkbox';
import { AuthService } from '../../core/services/auth-service';


@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, InputTextModule, ButtonModule, ToastModule, MessageModule, Checkbox, RouterLink],
  providers: [MessageService],
  templateUrl: './login-form.html',
  styleUrl: './login-form.css'
})
export class LoginForm {
    messageService = inject(MessageService);
    private router = inject(Router);
    private auth = inject(AuthService);

    isLoading = false;
    exampleForm: FormGroup;
    formSubmitted = false;
    showPassword = false;
    authError: string | null = null;

    constructor(private fb: FormBuilder) {
        this.exampleForm = this.fb.group({
            password: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    ngOnInit() {
      this.exampleForm.valueChanges.subscribe(() => {
        this.authError = null;
      })
    }

    onSubmit() {
        this.formSubmitted = true;

        if (this.exampleForm.valid) {
            this.isLoading = true;

            setTimeout(() => {
              const { email, password } = this.exampleForm.value;

              this.auth.login(email, password).subscribe({
                next: () => this.router.navigate(['/dashboard']),
                error: (err) => {
                  if (err.status === 401 || err.status === 403) {
                    this.authError = "Usuário ou senha incorretos";
                  } else {
                    this.authError = "Erro inesperado. Tente novamente."
                  }
                }
              });

              this.isLoading = false;
            }, 2000);
        }
    }

    isInvalid(controlName: string) {
        const control = this.exampleForm.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }

    togglePassword() {
      this.showPassword = !this.showPassword;
    }
}
