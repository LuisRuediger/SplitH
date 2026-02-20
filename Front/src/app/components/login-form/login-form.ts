import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { Checkbox } from 'primeng/checkbox';


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

    isLoading = false;
    exampleForm: FormGroup;
    formSubmitted = false;

    constructor(private fb: FormBuilder) {
        this.exampleForm = this.fb.group({
            password: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit() {
        this.formSubmitted = true;

        if (this.exampleForm.valid) {
            this.isLoading = true;

            // Simulação de login
            setTimeout(() => {
              console.log("Login realizado com sucesso!");

              this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Login realizado!' });

              this.isLoading = false;

              // 3. Navega para o Dashboard após o sucesso
              this.router.navigate(['/dashboard']);

            }, 2000);
        }
    }

    isInvalid(controlName: string) {
        const control = this.exampleForm.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }
}
