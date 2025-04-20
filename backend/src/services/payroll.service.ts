// import {Injectable, Logger} from '@nestjs/common';
// import {
//   BatchRepository,
//   EmployeeRepository,
//   LeaveRepository,
//   PayoutRepository,
//   TemporaryPayoutRepository,
// } from '../repositories';
// import {Batch, Payout, TemporaryPayout} from '../models';
// import {repository} from '@loopback/repository';

// @Injectable()
// export class PayrollService {
//   private readonly logger = new Logger(PayrollService.name);
//   private batchId: string | null = null;
//   private readonly payoutLimit: number = 20;
//   constructor(
//     @repository(EmployeeRepository)
//     private employeeRepository: EmployeeRepository,
//     @repository(LeaveRepository)
//     private leaveRepository: LeaveRepository,
//     @repository(TemporaryPayoutRepository)
//     private temporaryPayoutRepository: TemporaryPayoutRepository,
//     @repository(PayoutRepository)
//     private payoutRepository: PayoutRepository,
//     @repository(BatchRepository)
//     private batchRepository: BatchRepository,
    
//   ) {}

//   private async createBatch(
//     year: number,
//     month: number,
//     userId: string,
//     companyId: string,
//   ): Promise<void> {
//     try {
//       const existingBatch = await this.batchRepository.findOne({
//         where: {
//           year,
//           month,
//           userId,
//           companyId,
//         },
//       });

//       if (existingBatch) {
//         existingBatch.status = 'processing';
//         existingBatch.date = new Date().toISOString().split('T')[0];
//         existingBatch.time = new Date().toLocaleTimeString();

//         await this.batchRepository.update(existingBatch);
//         this.batchId = existingBatch.id ?? null;
//       } else {
//         const employeeCount = await this.employeeRepository.count();
//         const countValue = employeeCount.count ?? 0;
//         const newBatch: Batch = new Batch({
//           year,
//           month,
//           userId,
//           companyId,
//           status: 'processing',
//           date: new Date().toISOString().split('T')[0],
//           time: new Date().toLocaleTimeString(),
//           count: countValue,
//         });
//         const createdBatch = await this.batchRepository.create(newBatch);
//         this.batchId = createdBatch.id ?? null;
//       }
//     } catch (error) {
//       console.error('Error creating/updating batch:', error);
//       throw error;
//     }
//   }

//   private async pushToNewTable(): Promise<void> {
//     try {
//       if (this.batchId !== null) {
//         const dataToPush = await this.temporaryPayoutRepository.find({
//           where: {batchId: this.batchId},
//           limit: this.payoutLimit,
//         });
//         if (dataToPush.length > 0) {
//           const payoutsToCreate = dataToPush.map(payout => {
//             const {id, ...payoutData} = payout;
//             return new Payout(payoutData);
//           });
//           await this.temporaryPayoutRepository.deleteAll({
//             where: {batchId: this.batchId},
//           });
//           await this.payoutRepository.createAll(payoutsToCreate);
//           const payoutCount: any = await this.payoutRepository.count({
//             batchId: this.batchId,
//           });
//           await this.batchRepository.updateById(this.batchId, {
//             count: payoutCount,
//           });
//           const tempPayoutCount: any =
//             await this.temporaryPayoutRepository.count({
//               where: {batchId: this.batchId},
//             });
//           if (tempPayoutCount === 0) {
//             await this.batchRepository.updateById(this.batchId, {
//               status: 'done',
//             });
//             await this.temporaryPayoutRepository.updateAll({
//               batchId: this.batchId,
//             });
//             await this.temporaryPayoutRepository.deleteAll({
//               where: {batchId: this.batchId},
//             });
//           }
//         }
//       } else {
//         throw new Error('batchId is not initialized');
//       }
//     } catch (error) {
//       this.logger.error(`Error pushing data to new table: ${error}`);
//       this.logger.error(error);
//     }
//   }

//   async generatePayroll(
//     year: number,
//     month: number,
//     userId: string,
//     companyId: string,
//   ): Promise<void> {
//     try {
//       await this.createBatch(year, month, userId, companyId);
//       await this.continuePayrollGeneration(year, month,companyId);
//     } catch (error) {
//       console.error('Error generating payroll batch:', error);
//       throw error;
//     }
//   }

//   private async continuePayrollGeneration(
//     year: number,
//     month: number,
//     companyId:string,
//   ): Promise<void> {
//     try {
//       // const companyId =('companyId');
//       const employees = await this.employeeRepository.find({
//         where: {
//           companyId:companyId
//         }
//       });
//       const startDate = new Date(
//         `${year}-${month > 9 ? month : '0' + month}-01`,
//       );
//       const totalDaysInMonth = new Date(year, month, 0).getDate();
//       const endDate = new Date(
//         `${year}-${month > 9 ? month : '0' + month}-${totalDaysInMonth}`,
//       );
//       const attendanceData = await this.leaveRepository.find({
//         where: {
//           and: [{startDate: {lte: endDate}}, {startDate: {gte: startDate}}],
//         },
//       });

//       for (const employee of employees) {
//         const lossOfPayDays = attendanceData.filter(
//           attendance =>
//             attendance.employeeId === employee.id &&
//             attendance?.type?.value === 'loss of pay',
//         );

//         let leaveDayCount = lossOfPayDays.reduce(
//           (a, b) => a + (b['duration'] || 0),
//           0,
//         );

//         // Calculate the percentage of absence
//         const percentageOfAbsence = (leaveDayCount / totalDaysInMonth) * 100;
//         const absenceFactor = 1 - percentageOfAbsence / 100;

//         if (employee.salaryDetails) {
//           const annualCtcPerMonth = employee.salaryDetails.annualCtcPerMonth;

//           // Adjust all the values based on the absence factor
//           const basicValueUpdate = annualCtcPerMonth * 0.4 * absenceFactor;
//           const HraValueUpdate = annualCtcPerMonth * 0.2 * absenceFactor;
//           const DaValueUpdate = annualCtcPerMonth * 0.1 * absenceFactor;
//           const otherAllowanceValueUpdate =
//             annualCtcPerMonth * 0.15 * absenceFactor;
//           const grossSalary =
//             basicValueUpdate +
//             HraValueUpdate +
//             DaValueUpdate +
//             otherAllowanceValueUpdate;
//           const employeeESIC = grossSalary * 0.0175;
//           const employerESIC = grossSalary * 0.0475;
//           const employeePF = (basicValueUpdate + DaValueUpdate) * 0.12;
//           const employerPF = (basicValueUpdate + DaValueUpdate) * 0.12;
//           const totalDeduction =
//             grossSalary * 0.0175 +
//             (basicValueUpdate + DaValueUpdate) * 0.12 +
//             200;
//           const employerDeduction = employerESIC + employerPF;
//           const netSalary = grossSalary - totalDeduction;
//           const ctc = grossSalary + employerDeduction;

//           // Check if a payout record already exists for this employee and month
//           let existingPayout = await this.payoutRepository.findOne({
//             where: {
//               employeeId: employee.id,
//               year: year.toString(),
//               month: (month <= 9 ? '0' + month : month).toString(),
//             },
//           });

//           if (existingPayout) {
//             // Update existing payout record
//             existingPayout.leave = lossOfPayDays.length.toString();
//             existingPayout.salaryDetails = {
//               basic: parseFloat(basicValueUpdate.toFixed(2)),
//               Hra: parseFloat(HraValueUpdate.toFixed(2)),
//               Da: parseFloat(DaValueUpdate.toFixed(2)),
//               otherAllowance: parseFloat(otherAllowanceValueUpdate.toFixed(2)),
//               grossSalary: parseFloat(grossSalary.toFixed(2)),
//               netSalary: parseFloat(netSalary.toFixed(2)),
//               employeeESIC: parseFloat(employeeESIC.toFixed(2)),
//               employerESIC: parseFloat(employerESIC.toFixed(2)),
//               employeePF: parseFloat(employeePF.toFixed(2)),
//               employerPF: parseFloat(employerPF.toFixed(2)),
//               Pt: 200,
//               totalDeduction: parseFloat(totalDeduction.toFixed(2)),
//               employerDeduction: parseFloat(employerDeduction.toFixed(2)),
//               ctc: parseFloat(ctc.toFixed(2)),
//               lossOfPay: leaveDayCount,
//               workingDays: totalDaysInMonth - leaveDayCount,
//             };
//             await this.payoutRepository.update(existingPayout);
//           } else {
//             // Create new payout record
//             const newPayout: Payout = new Payout({
//               employeeId: employee.id,
//               year: year.toString(),
//               month: (month <= 9 ? '0' + month : month).toString(),
//               leave: lossOfPayDays.length.toString(),
//               salaryDetails: {
//                 basic: parseFloat(basicValueUpdate.toFixed(2)),
//                 Hra: parseFloat(HraValueUpdate.toFixed(2)),
//                 Da: parseFloat(DaValueUpdate.toFixed(2)),
//                 otherAllowance: parseFloat(
//                   otherAllowanceValueUpdate.toFixed(2),
//                 ),
//                 grossSalary: parseFloat(grossSalary.toFixed(2)),
//                 netSalary: parseFloat(netSalary.toFixed(2)),
//                 employeeESIC: parseFloat(employeeESIC.toFixed(2)),
//                 employerESIC: parseFloat(employerESIC.toFixed(2)),
//                 employeePF: parseFloat(employeePF.toFixed(2)),
//                 employerPF: parseFloat(employerPF.toFixed(2)),
//                 Pt: 200,
//                 totalDeduction: parseFloat(totalDeduction.toFixed(2)),
//                 employerDeduction: parseFloat(employerDeduction.toFixed(2)),
//                 ctc: parseFloat(ctc.toFixed(2)),
//                 lossOfPay: leaveDayCount,
//                 workingDays: totalDaysInMonth - leaveDayCount,
//               },
//               batchId: this.batchId ?? undefined,
//               companyId:companyId,
//             });
//             await this.payoutRepository.create(newPayout);
//           }

//           // Update temporary payout record
//           let existingTempPayout = await this.temporaryPayoutRepository.findOne(
//             {
//               where: {
//                 employeeId: employee.id,
//                 year: year.toString(),
//                 month: (month <= 9 ? '0' + month : month).toString(),
//               },
//             },
//           );

//           if (existingTempPayout) {
//             // Update existing temporary payout record
//             existingTempPayout.leave = lossOfPayDays.length.toString();
//             existingTempPayout.salaryDetails = {
//               basic: parseFloat(basicValueUpdate.toFixed(2)),
//               Hra: parseFloat(HraValueUpdate.toFixed(2)),
//               Da: parseFloat(DaValueUpdate.toFixed(2)),
//               otherAllowance: parseFloat(otherAllowanceValueUpdate.toFixed(2)),
//               grossSalary: parseFloat(grossSalary.toFixed(2)),
//               netSalary: parseFloat(netSalary.toFixed(2)),
//               employeeESIC: parseFloat(employeeESIC.toFixed(2)),
//               employerESIC: parseFloat(employerESIC.toFixed(2)),
//               employeePF: parseFloat(employeePF.toFixed(2)),
//               employerPF: parseFloat(employerPF.toFixed(2)),
//               Pt: 200,
//               totalDeduction: parseFloat(totalDeduction.toFixed(2)),
//               employerDeduction: parseFloat(employerDeduction.toFixed(2)),
//               ctc: parseFloat(ctc.toFixed(2)),
//               lossOfPay: leaveDayCount,
//               workingDays: totalDaysInMonth - leaveDayCount,
//             };
//             await this.temporaryPayoutRepository.update(existingTempPayout);
//           } else {
//             // Create new temporary payout record
//             const newTempPayout: TemporaryPayout = new TemporaryPayout({
//               employeeId: employee.id,
//               year: year.toString(),
//               month: (month <= 9 ? '0' + month : month).toString(),
//               leave: lossOfPayDays.length.toString(),
//               salaryDetails: {
//                 basic: parseFloat(basicValueUpdate.toFixed(2)),
//                 Hra: parseFloat(HraValueUpdate.toFixed(2)),
//                 Da: parseFloat(DaValueUpdate.toFixed(2)),
//                 otherAllowance: parseFloat(
//                   otherAllowanceValueUpdate.toFixed(2),
//                 ),
//                 grossSalary: parseFloat(grossSalary.toFixed(2)),
//                 netSalary: parseFloat(netSalary.toFixed(2)),
//                 employeeESIC: parseFloat(employeeESIC.toFixed(2)),
//                 employerESIC: parseFloat(employerESIC.toFixed(2)),
//                 employeePF: parseFloat(employeePF.toFixed(2)),
//                 employerPF: parseFloat(employerPF.toFixed(2)),
//                 Pt: 200,
//                 totalDeduction: parseFloat(totalDeduction.toFixed(2)),
//                 employerDeduction: parseFloat(employerDeduction.toFixed(2)),
//                 ctc: parseFloat(ctc.toFixed(2)),
//                 lossOfPay: leaveDayCount,
//                 workingDays: totalDaysInMonth - leaveDayCount,
//               },
//               batchId: this.batchId ?? undefined,
//               companyId:companyId,
//             });
//             await this.temporaryPayoutRepository.create(newTempPayout);
//           }
//         }
//       }
//       // Check if the temporary payout limit is reached
//       const tempPayoutCountObj = await this.temporaryPayoutRepository.count({
//         batchId: this.batchId,
//       });

//       const tempPayoutCount = tempPayoutCountObj.count ?? 0;

//       if (tempPayoutCount >= this.payoutLimit && this.batchId !== null) {
//         await this.pushToNewTable();
//         // Clear the temporary table
//         await this.temporaryPayoutRepository.deleteAll({
//           batchId: this.batchId,
//         });
//         this.logger.log('Temporary table cleared due to reaching the limit.');

//         // Update batch status to 'done' if needed
//         await this.batchRepository.updateById(this.batchId, {
//           status: 'done',
//         });
//         this.logger.log('Batch status updated to done.');
//       }
//     } catch (error) {
//       this.logger.error(`Error in continuePayrollGeneration: ${error}`);
//       throw error;
//     }
//   }
// }
