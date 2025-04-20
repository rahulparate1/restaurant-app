import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AlertModule } from 'ngx-bootstrap/alert';
// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { UIModule } from '../../shared/ui/ui.module';
import { Login2Component } from './login2/login2.component';
import { Register2Component } from './register2/register2.component';
import { Recoverpwd2Component } from './recoverpwd2/recoverpwd2.component';

import { AuthRoutingModule } from './auth-routing';
import { PasswordresetComponent } from './passwordreset/passwordreset.component';
import { NgOtpInputModule } from  'ng-otp-input';
import { CarouselModule } from "ngx-bootstrap/carousel";


@NgModule({
  declarations: [Login2Component, PasswordresetComponent, Register2Component, Recoverpwd2Component],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AlertModule.forRoot(),
    UIModule,
    AuthRoutingModule,
    SlickCarouselModule,
    NgOtpInputModule,
    CarouselModule.forRoot()
  ]
})
export class AuthModule { }
