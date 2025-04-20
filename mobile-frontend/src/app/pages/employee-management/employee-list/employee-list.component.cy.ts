import { EmployeeListComponent } from './employee-list.component'

describe('EmployeeListComponent', () => {
  it('should mount', () => {
    cy.mount(EmployeeListComponent)
  })
})