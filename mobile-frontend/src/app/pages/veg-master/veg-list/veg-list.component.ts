import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { VegMasterService } from '../veg-master.service';

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
  vegList: any;

    constructor(
      public router: Router,
      private vegService: VegMasterService
    ) {
    }

    ngOnInit(): void {

      this.fetchCategoryList();

    }

    async fetchCategoryList() {
      let url = 'http://127.0.0.1:3000/vegs'; // API endpoint to fetch categories
     (await this.vegService.getAllItems(url)).subscribe(
        (res: any) => {
          if (res) {
            this.vegList = res; // Assigning the response to categoryList
          } else {
            console.error('Error fetching veg data:', res);
          }
        },
        (error) => {
          console.error('Error fetching veg:', error);
        }
      );
    }

    increaseQuantity(item: any) {
      item.quantity = (item.quantity || 0) + 1;
    }

    decreaseQuantity(item: any) {
      if (item.quantity && item.quantity > 0) {
        item.quantity -= 1;
      }
    }

    addNewMenu() {
      this.router.navigate(['/dashboard/veg-master/form']);
    }

    goToProfile(){
      this.router.navigate([('/dashboard/profile/profile-info')])
    }

    editItem(id: string) {
      this.router.navigate(['/dashboard/veg-master/form/' + id]);
    }
}
