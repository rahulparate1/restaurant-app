



// import { Component, OnInit } from '@angular/core';
// import Swal from 'sweetalert2';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-cart',
//   templateUrl: './cart.component.html',
//   styleUrls: ['./cart.component.css'] // Remove this if you're not using a .scss file
// })
// export class CartComponent implements OnInit {

//   cartItems: any[] = [];
//   note: string = '';

//   constructor(private http: HttpClient) {}

//   ngOnInit(): void {
//     const storedCart = localStorage.getItem('vegCart');
//     this.cartItems = storedCart ? JSON.parse(storedCart) : [];
//   }

//   increaseQuantity(index: number) {
//     this.cartItems[index].quantity += 1;
//     this.updateCartStorage();
//   }

//   decreaseQuantity(index: number) {
//     if (this.cartItems[index].quantity > 1) {
//       this.cartItems[index].quantity -= 1;
//       this.updateCartStorage();
//     } else {
//       this.removeItem(index);
//     }
//   }

//   removeItem(index: number) {
//     this.cartItems.splice(index, 1);
//     this.updateCartStorage();
//   }

//   updateCartStorage() {
//     localStorage.setItem('vegCart', JSON.stringify(this.cartItems));
//   }

//   getTotal(): number {
//     return this.cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
//   }


//   placeOrder() {
//     if (this.cartItems.length === 0) {
//       Swal.fire('Cart is empty!', 'Please add items to cart.', 'warning');
//       return;
//     }

//     Swal.fire({
//       title: 'Are you sure?',
//       text: 'Do you want to confirm this order?',
//       icon: 'question',
//       showCancelButton: true,
//       confirmButtonColor: '#ce1212',
//       cancelButtonColor: '#6c757d',
//       confirmButtonText: 'Yes, Order Now'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const payload = {
//           items: this.cartItems.map(i => ({
//             itemId: i._id,
//             name: i.name,
//             quantity: i.quantity,
//             price: i.price
//           })),
//           totalAmount: this.getTotal(),
//           orderDate: new Date(),
//           note: this.note
//         };

//         this.http.post('http://127.0.0.1:3000/orders', payload).subscribe(
//           (res) => {
//             Swal.fire('Order Placed!', 'Your order has been submitted successfully.', 'success');
//             localStorage.removeItem('vegCart');
//             this.cartItems = [];
//             this.note = '';
//           },
//           (err) => {
//             console.error(err);
//             Swal.fire('Error!', 'Something went wrong placing your order.', 'error');
//           }
//         );
//       }
//     });
//   }

// }




import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'] // Use .css or .scss based on what you are using
})
export class CartComponent implements OnInit {

  cartItems: any[] = [];
  note: string = '';

  constructor(
    private http: HttpClient,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
  }

  loadCartItems() {
    const vegCart = JSON.parse(localStorage.getItem('vegCart') || '[]');
    const nonVegCart = JSON.parse(localStorage.getItem('nonVegCart') || '[]');
    this.cartItems = [...vegCart, ...nonVegCart];
  }

  increaseQuantity(index: number) {
    this.cartItems[index].quantity += 1;
    this.updateCartStorage();
  }

  decreaseQuantity(index: number) {
    if (this.cartItems[index].quantity > 1) {
      this.cartItems[index].quantity -= 1;
      this.updateCartStorage();
    } else {
      this.removeItem(index);
    }
  }

  removeItem(index: number) {
    this.cartItems.splice(index, 1);
    this.updateCartStorage();
  }

  updateCartStorage() {
    const vegItems = this.cartItems.filter(item => item.isVeg);
    const nonVegItems = this.cartItems.filter(item => !item.isVeg);

    localStorage.setItem('vegCart', JSON.stringify(vegItems));
    localStorage.setItem('nonVegCart', JSON.stringify(nonVegItems));
  }

  getTotal(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }

  placeOrder() {
    if (this.cartItems.length === 0) {
      Swal.fire('Cart is empty!', 'Please add items to cart.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to confirm this order?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ce1212',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Order Now'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          items: this.cartItems.map(i => ({
            itemId: i.itemId || i._id,
            name: i.name,
            quantity: i.quantity,
            price: i.price
          })),
          totalAmount: this.getTotal(),
          orderDate: new Date(),
          note: this.note
        };

        this.http.post('http://127.0.0.1:3000/orders', payload).subscribe(
          (res) => {
            Swal.fire('Order Placed!', 'Your order has been submitted successfully.', 'success');
            localStorage.removeItem('vegCart');
            localStorage.removeItem('nonVegCart');
            this.cartItems = [];
            this.note = '';
          },
          (err) => {
            console.error(err);
            Swal.fire('Error!', 'Something went wrong placing your order.', 'error');
          }
        );
      }
    });
  }

  goToMenu(){
    this.router.navigate(['/dashboard/tab']);
  }

}
