import { Component, Input } from "@angular/core";
import { FormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EmployeeManagementService } from "../../employee-management.service";

@Component({
  selector: "app-leave-details",
  templateUrl: "./leave-details.component.html",
  styleUrls: ["./leave-details.component.css"],
})
export class LeaveDetailsComponent {
  breadCrumbItems: Array<{}>;
  leaveDetailsForm: UntypedFormGroup;
  @Input() employeeId;
  employee;
  leaveData: any[] = [];
  employeeLeaveBalance = {};

  constructor(
    private formBuilder: FormBuilder,
    private activeRoute: ActivatedRoute,
    public router: Router,
    private employeeService: EmployeeManagementService
  ) {}

  ngOnInit() {
    this.breadCrumbItems = [
      { label: "Forms" },
      { label: "Form Wizard", active: true },
    ];
    this.leaveDetailsForm = this.formBuilder.group({});
    this.getLeaveTypeList();
    this.patchLeaveDetails();
  }

  get form() {
    return this.leaveDetailsForm.controls;
  }

  async patchLeaveDetails() {
    let employeeId = this.activeRoute.snapshot.paramMap.get("id");
    if (employeeId && employeeId !== "0") {
      (await this.employeeService.getEmployeeDetails(employeeId)).subscribe(
        (res) => {
          if (res && res.leaveBalance) {
            this.employeeLeaveBalance = res.leaveBalance;
          }
        },
        (err) => {
          console.error("Error fetching leave details:", err);
        }
      );
    }
  }

  // async onSubmit() {
  //   if (this.leaveDetailsForm.status !== "INVALID") {
  //     let employeeId = this.activeRoute.snapshot.paramMap.get("id");
  //     if (employeeId) {
  //       (
  //         await this.employeeService.postEntities(
  //           this.employeeLeaveBalance,
  //           employeeId,
  //           "leaveBalance"
  //         )
  //       ).subscribe(
  //         (res: any) => {
  //           let link =
  //             "/employee/employee/" + employeeId + "/" + "bank-details";
  //           window.location.href = window.location.origin + link;
  //         },
  //         (error: any) => {
  //           console.error("Error saving leave details:", error);
  //           alert("Error occurred while saving leave details");
  //         }
  //       );
  //     }
  //   } else {
  //     alert("Please fill all required fields");
  //   }
  // }

  // async onSubmit() {
  //   if (this.leaveDetailsForm.status !== "INVALID") {
  //     let employeeId = this.activeRoute.snapshot.paramMap.get("id");

  //     if (employeeId) {
  //       // Initialize employeeLeaveBalance
  //       this.employeeLeaveBalance = this.employeeLeaveBalance || {};

  //       // Collect all leave balances from the form
  //       const leaveBalances: { [key: string]: number } = {};
  //       Object.keys(this.leaveDetailsForm.controls).forEach((controlName) => {
  //         // Use the control name and form value
  //         const controlValue = this.leaveDetailsForm.get(controlName)?.value;
  //         leaveBalances[controlName] = Number(controlValue) || 0; // Convert to number or default to 0
  //       });

  //       // Construct leaveBalanceObject
  //       const leaveBalanceObject = {
  //         employeeId: employeeId,
  //         leaveBalances: leaveBalances,
  //       };

  //       try {
  //         // Send leaveBalanceObject to API
  //         const leaveBalanceResponse = await this.employeeService.postLeaveBalance(leaveBalanceObject);

  //         leaveBalanceResponse.subscribe({
  //           next: () => {
  //             let link = `/employee/employee/${employeeId}/bank-details`;
  //             window.location.href = window.location.origin + link;
  //           },
  //           error: (error) => {
  //             console.error("Error saving leave balance:", error);
  //             alert("Error occurred while saving leave balance");
  //           },
  //         });
  //       } catch (error) {
  //         console.error("Error occurred:", error);
  //         alert("Error occurred while saving leave details");
  //       }
  //     }
  //   } else {
  //     alert("Please fill all required fields");
  //   }
  // }

  async onSubmit() {
    if (this.leaveDetailsForm.status !== "INVALID") {
      const employeeId = this.activeRoute.snapshot.paramMap.get("id");

      if (employeeId) {
        try {
          // Fetch the employee details for employee name
          (await this.employeeService.getEmployeebyId(employeeId)).subscribe({
            next: async (employeeDetails) => {
              if (!employeeDetails || !employeeDetails.basicDetails) {
                console.error("Employee details not found.");
                alert("Employee details could not be fetched.");
                return;
              }

              // Extract and format the employee name
              const basicDetails = employeeDetails.basicDetails as {
                firstName: string;
                lastName: string;
              };
              const employeeName = `${basicDetails?.firstName || ""} ${
                basicDetails?.lastName || ""
              }`.trim();

              // Fetch leave types
              (await this.employeeService.getLeaveType()).subscribe({
                next: async (leaveTypeData) => {
                  // Map leave type names to their IDs
                  const leaveTypeMap: {
                    [key: string]: { id: string; name: string };
                  } = {};

                  leaveTypeData.forEach((leaveType: any) => {
                    if (leaveType.name && typeof leaveType.name === "string") {
                      // Normalize the name for matching
                      const normalizedLeaveTypeName = leaveType.name
                        .trim()
                        .toLowerCase();
                      leaveTypeMap[normalizedLeaveTypeName] = {
                        id: leaveType.id,
                        name: leaveType.name,
                      };
                    } else {
                      console.warn(
                        `Invalid leave type name detected: ${leaveType.name}`
                      );
                    }
                  });

                  // Construct leaveBalances array
                  const leaveBalances: {
                    id: string;
                    leaveTypeName: string;
                    value: number;
                  }[] = [];

                  Object.keys(this.leaveDetailsForm.controls).forEach(
                    (controlName) => {
                      // Normalize the control name and match it
                      const normalizedControlName = controlName
                        .trim()
                        .toLowerCase();
                      const leaveType = leaveTypeMap[normalizedControlName];

                      if (leaveType) {
                        const controlValue =
                          this.leaveDetailsForm.get(controlName)?.value || 0;
                        if (controlValue > 0) {
                          leaveBalances.push({
                            id: leaveType.id,
                            leaveTypeName: leaveType.name,
                            value: Number(controlValue),
                          });
                        }
                      } else {
                        console.warn(
                          `No matching leave type for control: ${controlName}`
                        );
                      }
                    }
                  );

                  if (leaveBalances.length === 0) {
                    console.error("No leave balances were found.");
                    alert(
                      "No leave balances were found. Please ensure leave types are selected correctly."
                    );
                    return;
                  }

                  // Include employeeName in the leaveBalanceObject
                  const leaveBalanceObject = {
                    employeeId: employeeId,
                    employeeName: employeeName,
                    leaveBalances: leaveBalances,
                  };

                  // Send the leaveBalanceObject to the API
                  (
                    await this.employeeService.postLeaveBalance(
                      leaveBalanceObject
                    )
                  ).subscribe({
                    next: () => {
                      const link = `/employee/employee/${employeeId}/bank-details`;
                      window.location.href = window.location.origin + link;
                    },
                    error: (error) => {
                      console.error("Error saving leave balance:", error);
                      alert("Error occurred while saving leave balance");
                    },
                  });
                },
                error: (error) => {
                  console.error("Error fetching leave types", error);
                  alert("Error occurred while fetching leave types");
                },
              });
            },
            error: (error) => {
              console.error("Error fetching employee details:", error);
              alert("Error occurred while fetching employee details");
            },
          });
        } catch (error) {
          console.error("Error occurred:", error);
          alert("Error occurred while saving leave details");
        }
      }
    } else {
      alert("Please fill all required fields");
    }
  }

  // Fetch the leave types data
  async getLeaveTypeList() {
    (await this.employeeService.getLeaveType()).subscribe(
      (res) => {
        this.leaveData = res || [];
        this.leaveData.forEach((item) => {
          if (item.value === undefined) {
            item.value = "";
          }
          this.leaveDetailsForm.addControl(
            item.name,
            this.formBuilder.control(item.value, Validators.required)
          );
        });
      },
      (error) => {
        console.error("Error fetching leave data", error);
      }
    );
  }
}
