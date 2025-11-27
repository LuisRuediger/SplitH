import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { Checkbox } from 'primeng/checkbox';


@Component({
  selector: 'app-login-form',
  imports: [ReactiveFormsModule, FormsModule, InputTextModule, ButtonModule, ToastModule, MessageModule, Checkbox],
  providers: [MessageService],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss'
})
export class LoginForm {
    messageService = inject(MessageService);

    exampleForm: FormGroup;

    formSubmitted = false;

    value3: string | undefined;

    constructor(private fb: FormBuilder) {
        this.exampleForm = this.fb.group({
            senha: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    onSubmit() {
        this.formSubmitted = true;
        if (this.exampleForm.valid) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Form Submitted', life: 3000 });
            this.exampleForm.reset();
            this.formSubmitted = false;
        }
    }

    isInvalid(controlName: string) {
        const control = this.exampleForm.get(controlName);
        return control?.invalid && (control.touched || this.formSubmitted);
    }
}
