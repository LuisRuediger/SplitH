import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideRouter } from '@angular/router'; // 1. Importe o provideRouter
import { routes } from './app.routes'; // 2. Importe o arquivo de rotas que criamos
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/services/auth-interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes), // 3. Adicione aqui para ativar a navegação!
        provideAnimationsAsync(),
        provideHttpClient(withInterceptors([authInterceptor])),
        providePrimeNG({

          theme: {
            preset: Aura,
            options: {
              prefix: 'p',
              darkModeSelector: 'system',
              cssLayer: false
          }
        }
        })
    ]
};