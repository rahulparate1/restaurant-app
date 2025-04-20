import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScrollspyDirective } from './scrollspy.directive'
import { HeaderComponent } from 'src/app/pages/header/header.component';
import { FooterComponent } from 'src/app/pages/footer/footer.component';

@NgModule({
    declarations: [
      ScrollspyDirective,
      HeaderComponent,
      FooterComponent
    ],
    imports: [
        CommonModule,
    ],
    exports: [ScrollspyDirective, HeaderComponent, FooterComponent],
})
export class SharedModule { }
