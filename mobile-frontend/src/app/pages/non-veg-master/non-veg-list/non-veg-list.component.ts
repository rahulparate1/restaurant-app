import { Component } from "@angular/core";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { NonVegMasterService } from "../non-veg-master.service";

@Component({
  selector: "app-non-veg-list",
  templateUrl: "./non-veg-list.component.html",
  styleUrls: ["./non-veg-list.component.scss"],
})
export class NonVegListComponent {
  nonVegList: any = [];

  constructor(public router: Router, private service: NonVegMasterService) {}

  ngOnInit(): void {
    this.fetchNonVegList();
  }

  async fetchNonVegList() {
    const url = "http://127.0.0.1:3000/non-vegs";
    (await this.service.getAllItems(url)).subscribe(
      (res: any) => {
        if (res) {
          this.nonVegList = res.map((item: any) => ({ ...item, quantity: 0 }));
        } else {
          console.error("Error fetching non-veg data:", res);
        }
      },
      (error) => {
        console.error("Error fetching non-veg:", error);
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

  // addSelectedToCart() {
  //   const selectedItems = this.nonVegList.filter(
  //     (item: any) => item.quantity && item.quantity > 0
  //   );

  //   if (selectedItems.length === 0) {
  //     Swal.fire(
  //       "No Items Selected",
  //       "Please increase quantity for at least one item.",
  //       "warning"
  //     );
  //     return;
  //   }

  //   const existingCart = JSON.parse(localStorage.getItem("nonVegCart") || "[]");

  //   for (const selected of selectedItems) {
  //     const existingIndex = existingCart.findIndex(
  //       (i: any) => i.itemId === selected.id || i.itemId === selected._id
  //     );
  //     if (existingIndex > -1) {
  //       existingCart[existingIndex].quantity += selected.quantity;
  //     } else {
  //       existingCart.push({
  //         itemId: selected.id || selected._id,
  //         name: selected.name,
  //         price: selected.price,
  //         quantity: selected.quantity,
  //         image: selected.image,
  //       });
  //     }
  //     selected.quantity = 0;
  //   }

  //   localStorage.setItem("nonVegCart", JSON.stringify(existingCart));
  //   Swal.fire("Done!", "Selected items added to cart.", "success");
  // }

  addSelectedToCart() {
    const selectedItems = this.nonVegList.filter(
      (item: any) => item.quantity && item.quantity > 0
    );

    if (selectedItems.length === 0) {
      Swal.fire(
        "No Items Selected",
        "Please increase quantity for at least one item.",
        "warning"
      );
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
        const existingCart = JSON.parse(localStorage.getItem("nonVegCart") || "[]");

        for (const selected of selectedItems) {
          const existingIndex = existingCart.findIndex(
            (i: any) => i.itemId === selected.id || i.itemId === selected._id
          );
          if (existingIndex > -1) {
            existingCart[existingIndex].quantity += selected.quantity;
          } else {
            existingCart.push({
              itemId: selected.id || selected._id,
              name: selected.name,
              price: selected.price,
              quantity: selected.quantity,
              image: selected.image,
            });
          }
          selected.quantity = 0;
        }

        localStorage.setItem("nonVegCart", JSON.stringify(existingCart));

        // Now ask if they want to go to cart
        Swal.fire({
          title: 'Items added!',
          text: 'Do you want to go to the cart?',
          icon: 'success',
          showCancelButton: true,
          confirmButtonColor: '#ce1212',
          cancelButtonColor: '#6c757d',
          confirmButtonText: 'Yes, Go to Cart',
          cancelButtonText: 'No, Stay Here'
        }).then((nextResult) => {
          if (nextResult.isConfirmed) {
            this.router.navigate(['/dashboard/cart/list']);
          }
        });
      }
    });
  }


  addNewMenu() {
    this.router.navigate(["/dashboard/non-veg-master/form"]);
  }

  editItem(id: string) {
    this.router.navigate(["/dashboard/non-veg-master/form/" + id]);
  }
}
