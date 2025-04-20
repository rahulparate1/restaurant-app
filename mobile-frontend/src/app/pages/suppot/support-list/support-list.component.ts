import { Component } from '@angular/core';
import { rolesType, SupportStatusList } from 'src/app/layouts/shared/constant';
import Swal from 'sweetalert2';
import { SupportTypeService } from '../support-type.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success',
    cancelButton: 'btn btn-secondary ms-2',
  },
  buttonsStyling: true,
  allowOutsideClick: false,
});
@Component({
  selector: 'app-support-list',
  templateUrl: './support-list.component.html',
  styleUrls: ['./support-list.component.css']
})
export class SupportListComponent {
 
  breadCrumbItems: Array<{}>;
  supportTypeList: any;
  supportTypeData: any[];
  filterBy;
  id: string;
  designationRole: { key: string; value: string }[];
  slideConfig = {
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    dots: true,
  };

  constructor(
    public router: Router,
    private SupportTypeService: SupportTypeService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.breadCrumbItems = [
      { label: "Support Type List" },
      { label: "type list ", active: true },
    ];
  this.designationRole = rolesType;
    this. getSupportList();
  }

  // Fetch the department list
  async getSupportList() {
    (await this.SupportTypeService.getSupport()).subscribe(
      (res) => {
        this.supportTypeList = res.data || [];  
        this.supportTypeData = [...this.supportTypeList]; 
      },
      (error) => {
        console.error('Error fetching support data', error);
      }
    );
  }

  // Filter the list based on the department name
  filter() {
    this.supportTypeData = [
      ...this.supportTypeList.filter((item) =>
        item.title.toLowerCase().includes(this.filterBy.toLowerCase())
      ),
    ];
  }


  // Delete an department
  deleteSupport(id: any) {
    swalWithBootstrapButtons
      .fire({
        title: "Are you sure, You won't be able to revert this?",
        confirmButtonText: "Yes, Delete!",
        cancelButtonText: "No",
        showCancelButton: true,
      })
      .then(async (result) => {
        if (result.value) {
          (await this.SupportTypeService.deleteSupport(id)).subscribe(
            () => {
              this. getSupportList();
            },
            (error) => {
              console.error("Error deleting support", error);
            }
          );
        }
      });
  }

  onEdit(id: string) {
    this.router.navigate(['/support-type/form-type', id]);  
  }

  addSupport() {
    this.router.navigate(["support-type/form-type"]);
  }
}
