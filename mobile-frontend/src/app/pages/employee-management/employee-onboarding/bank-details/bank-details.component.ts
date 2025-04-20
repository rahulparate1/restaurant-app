import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EmployeeManagementService } from "../../employee-management.service";
import { bankNameList } from "src/app/layouts/shared/constant";

export function matchAccountNumberValidator(
  accountNumberControlName: string,
  reAccountNumberControlName: string
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const accountNumberControl = formGroup.get(accountNumberControlName);
    const reAccountNumberControl = formGroup.get(reAccountNumberControlName);

    if (
      accountNumberControl &&
      reAccountNumberControl &&
      accountNumberControl.value !== reAccountNumberControl.value
    ) {
      return { accountMismatch: true };
    }

    return null;
  };
}

@Component({
  selector: "app-bank-details",
  templateUrl: "./bank-details.component.html",
  styleUrls: ["./bank-details.component.css"],
})
export class BankDetailsComponent implements OnInit {
  bankDetailsForm: UntypedFormGroup;
  employeeId: string;
  bankData: Object;

  // Regular expression for validating IFSC Code
  ifscCodePattern = /^[A-Za-z]{4}[0]{1}[A-Za-z0-9]{6}$/;
  bankName: string[];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activeRoute: ActivatedRoute,
    private employeeService: EmployeeManagementService
  ) {}

  ngOnInit(): void {
    this.bankName = bankNameList;
    this.bankDetailsForm = this.formBuilder.group(
      {
        accountHolderName: ["", [Validators.required, Validators.minLength(3)]],
        bankName: ["", [Validators.required]],
        ifscCode: ["", [Validators.required, Validators.pattern(this.ifscCodePattern)],],
        accountNumber: ["", [Validators.required, Validators.pattern(/^\d{10,18}$/),],],
        reAccountNumber: ["", [Validators.required, Validators.pattern(/^\d{10,18}$/)],],
        accountType: ["", [Validators.required]],
      },
      {
        validator: matchAccountNumberValidator(
          "accountNumber",
          "reAccountNumber"
        ),
      }
    );
    this.patchBankDetails();
  }

  get form() {
    return this.bankDetailsForm.controls;
  }

  async patchBankDetails() {
    let employeeId = this.activeRoute.snapshot.paramMap.get("id");
    if (employeeId && employeeId !== "0") {
      (await this.employeeService.getEmployeeDetails(employeeId)).subscribe(
        (res) => {
          this.bankDetailsForm.patchValue({
            accountHolderName: res.bankDetails?.accountHolderName,
            bankName: res.bankDetails?.bankName,
            ifscCode: res.bankDetails?.ifscCode,
            accountNumber: res.bankDetails?.accountNumber,
            reAccountNumber: res.bankDetails?.reAccountNumber,
            accountType: res.bankDetails?.accountType,
          });
        },
        (err) => {
          console.error("Error fetching bank details:", err);
        }
      );
    }
  }

  async onSubmit() {
    if (this.bankDetailsForm.valid) {
      const bankDetailsObj = {
        accountHolderName: this.bankDetailsForm.value.accountHolderName,
        bankName: this.bankDetailsForm.value.bankName,
        ifscCode: this.bankDetailsForm.value.ifscCode,
        accountNumber: this.bankDetailsForm.value.accountNumber,
        reAccountNumber: this.bankDetailsForm.value.reAccountNumber,
        accountType: this.bankDetailsForm.value.accountType,
      };

      let employeeId = this.activeRoute.snapshot.paramMap.get("id");
      if (employeeId)
        (
          await this.employeeService.postEntities(
            bankDetailsObj,
            employeeId,
            "bankDetails"
          )
        ).subscribe(
          (res) => {
            this.bankData = res;
            let link = "/employee/list";
            window.location.href = window.location.origin + link;
          },
          (error) => {
            console.error("Error saving bank details", error);
          }
        );
    } else {
      alert("Please fill all required fields");
    }
  }
}
