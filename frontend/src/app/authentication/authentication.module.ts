import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: "login", component: LoginComponent,

  },
  {
    path: "register", component: RegisterComponent,

  },
  {
    path: "forgot-password", component: ForgotPasswordComponent,

  },
];

export const authenticationRouting = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent
  ],
  imports: [
    CommonModule,
    authenticationRouting
  ]
})
export class AuthenticationModule { }
