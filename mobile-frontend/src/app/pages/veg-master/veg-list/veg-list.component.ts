import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-veg-list',
  templateUrl: './veg-list.component.html',
  styleUrls: ['./veg-list.component.scss']
})
export class VegListComponent {

  menuItems = [
    {
      name: 'Magnam Tiste',
      ingredients: 'Lorem, deren, trataro, filede, nerada',
      price: 5.95,
      quantity: 1,
      image: 'assets/img/menu/menu-item-1.png'
    },
    {
      name: 'Magnam Tiste',
      ingredients: 'Lorem, deren, trataro, filede, nerada',
      price: 5.95,
      quantity: 1,
      image: 'assets/img/menu/menu-item-2.png'
    },
    {
      name: 'Magnam Tiste',
      ingredients: 'Lorem, deren, trataro, filede, nerada',
      price: 5.95,
      quantity: 1,
      image: 'assets/img/menu/menu-item-3.png'
    },
    {
      name: 'Magnam Tiste',
      ingredients: 'Lorem, deren, trataro, filede, nerada',
      price: 5.95,
      quantity: 1,
      image: 'assets/img/menu/menu-item-4.png'
    },
    // Add more items here...
  ];

    constructor(
      public router: Router
    ) {
    }

    ngOnInit(): void {

    }

    increaseQuantity(item: any) {
      item.quantity++;
    }

    decreaseQuantity(item: any) {
      if (item.quantity > 1) item.quantity--;
    }

    addNewMenu() {
      // Logic to show a modal or route to add menu
    }

    goToProfile(){
      this.router.navigate([('/dashboard/profile/profile-info')])
    }

}
