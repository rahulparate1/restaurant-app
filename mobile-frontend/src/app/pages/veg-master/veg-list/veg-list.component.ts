import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { VegMasterService } from "../veg-master.service";
import Swal from "sweetalert2"; // optional: for nice alerts
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-veg-list",
  templateUrl: "./veg-list.component.html",
  styleUrls: ["./veg-list.component.scss"],
})
export class VegListComponent {
  vegList: any = [];

  constructor(
    public router: Router,
    private vegService: VegMasterService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchCategoryList();
  }

  async fetchCategoryList() {
    const url = "http://127.0.0.1:3000/vegs";
    (await this.vegService.getAllItems(url)).subscribe(
      (res: any) => {
        if (res) {
          this.vegList = res.map((item: any) => ({ ...item, quantity: 0 }));
        } else {
          console.error("Error fetching veg data:", res);
        }
      },
      (error) => {
        console.error("Error fetching veg:", error);
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
  //   const selectedItems = this.vegList.filter(
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

  //   const existingCart = JSON.parse(localStorage.getItem("vegCart") || "[]");

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
  //     selected.quantity = 0; // reset after adding
  //   }

  //   localStorage.setItem("vegCart", JSON.stringify(existingCart));
  //   Swal.fire("Done!", "Selected items added to cart.", "success");
  // }

  addSelectedToCart() {
    const selectedItems = this.vegList.filter(
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
        const existingCart = JSON.parse(localStorage.getItem("vegCart") || "[]");

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
          selected.quantity = 0; // reset after adding
        }

        localStorage.setItem("vegCart", JSON.stringify(existingCart));

        // After adding, ask to go to cart
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
    this.router.navigate(["/dashboard/veg-master/form"]);
  }

  goToProfile() {
    this.router.navigate(["/dashboard/profile/profile-info"]);
  }

  editItem(id: string) {
    this.router.navigate(["/dashboard/veg-master/form/" + id]);
  }
}
