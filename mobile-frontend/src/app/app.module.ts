import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { environment } from "../environments/environment";

import { SlickCarouselModule } from "ngx-slick-carousel";
import { TabsModule } from "ngx-bootstrap/tabs";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { ToastrModule } from "ngx-toastr";
import { ScrollToModule } from "@nicky-lenaers/ngx-scroll-to";
import { SharedModule } from "./cyptolanding/shared/shared.module";

import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { EffectsModule } from "@ngrx/effects";

import { ExtrapagesModule } from "./extrapages/extrapages.module";
import { LayoutsModule } from "./layouts/layouts.module";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { CyptolandingComponent } from "./cyptolanding/cyptolanding.component";

// Importing ReactiveFormsModule
import { ReactiveFormsModule } from "@angular/forms";

import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { ErrorInterceptor } from "./core/helpers/error.interceptor";
import { JwtInterceptor } from "./core/helpers/jwt.interceptor";
import { FakeBackendInterceptor } from "./core/helpers/fake-backend";

import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { rootReducer } from "./store";
import { initFirebaseBackend } from "./authUtils";
import { FilemanagerEffects } from "./store/filemanager/filemanager.effects";
import { OrderEffects } from "./store/orders/order.effects";
import { AuthenticationEffects } from "./store/Authentication/authentication.effects";
import { CartEffects } from "./store/Cart/cart.effects";
import { ProjectEffects } from "./store/ProjectsData/project.effects";
import { usersEffects } from "./store/UserGrid/user.effects";
import { userslistEffects } from "./store/UserList/userlist.effect";
import { CandidateEffects } from "./store/Candidate/candidate.effects";
import { JoblistEffects } from "./store/Job/job.effects";
import { InvoiceDataEffects } from "./store/Invoices/invoice.effects";
import { ChatEffects } from "./store/Chat/chat.effect";
import { tasklistEffects } from "./store/Tasks/tasks.effect";
import { OrdersEffects } from "./store/Crypto/crypto.effects";
import { CustomerEffects } from "./store/customer/customer.effects";
import { MailEffects } from "./store/Email/email.effects";
import { FullCalendarModule } from "@fullcalendar/angular";
import { FormsModule } from "@angular/forms";
import { NgbNavModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { HeaderComponent } from "./pages/header/header.component";
import { FooterComponent } from "./pages/footer/footer.component";

// Other imports for effects and services...

if (environment.defaultauth === "firebase") {
  initFirebaseBackend(environment.firebaseConfig);
} else {
  FakeBackendInterceptor;
}

export function createTranslateLoader(http: HttpClient): any {
  return new TranslateHttpLoader(http, "assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    CyptolandingComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    FormsModule,
    FullCalendarModule,
    BrowserAnimationsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    LayoutsModule,
    AppRoutingModule,
    ExtrapagesModule,
    AccordionModule.forRoot(),
    TabsModule.forRoot(),
    TooltipModule.forRoot(),
    SharedModule,
    ScrollToModule.forRoot(),
    SlickCarouselModule,
    // ToastrModule.forRoot(),
    BrowserAnimationsModule,
    // ToastrModule.forRoot({
    //   positionClass: 'toast-top-right',
    //   timeOut: 5000,
    // }),
    ToastrModule.forRoot({
      positionClass: "toast-top-right",
      disableTimeOut: true,
      closeButton: true,
      tapToDismiss: false,
    }),
    StoreModule.forRoot(rootReducer),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
    }),
    EffectsModule.forRoot([
      FilemanagerEffects,
      OrderEffects,
      AuthenticationEffects,
      CartEffects,
      ProjectEffects,
      usersEffects,
      userslistEffects,
      JoblistEffects,
      CandidateEffects,
      InvoiceDataEffects,
      ChatEffects,
      tasklistEffects,
      OrdersEffects,
      CustomerEffects,
      MailEffects,
      NgbNavModule,
      NgbTooltipModule,
    ]),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: FakeBackendInterceptor,
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
