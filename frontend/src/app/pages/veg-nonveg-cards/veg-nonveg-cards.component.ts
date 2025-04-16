import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-veg-nonveg-cards',
  templateUrl: './veg-nonveg-cards.component.html',
  styleUrls: ['./veg-nonveg-cards.component.scss']
})
export class VegNonvegCardsComponent {




    constructor(
      public router: Router
    ) {}

    ngOnInit(): void {

    }

    addVegItems(){
      this.router.navigate(['/veg-master/form'])
    }

    addNonVegItems(){
      this.router.navigate(['/non-veg-master/form'])
    }

    addVegCategory(){
      this.router.navigate(['/veg-category/form'])
    }

    addNonVegCategory(){
      this.router.navigate(['/non-veg-category/form'])
    }

}
