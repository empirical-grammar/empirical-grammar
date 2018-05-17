describe('Credit Card Modal', () => {
  after(() => {
    cy.logout()
  })

  beforeEach(function() {
    Cypress.Cookies.preserveOnce('_quill_session')
  })

  describe('when I open the modal without a credit card associated with my account', ()=>{
    before(() =>{
      cy.cleanDatabase()
      cy.factoryBotCreate({
        factory: 'teacher',
        password: 'password',
        username: 'teacher'
      }).then(() => {
        cy.login('teacher', 'password')
        cy.visit('/premium')
      })
      cy.get('#purchase-btn').click()
    })

    it('loads', ()=>{
      cy.get('.select-credit-card-modal')
    })

    describe('the option to enter a credit card', ()=> {
      it('opens the stripe modal when clicked', ()=>{
        cy.get('#purchase-btn').click()
      })
    })

  })

  describe('when I open the modal with a credit card associated with my account', ()=>{
    before(()=>{
      cy.cleanDatabase()
      cy.factoryBotCreate({
        factory: 'teacher',
        password: 'password',
        username: 'teacher',
        stripe_customer_id: 'cus_CN6VaNY6yd8R5M'
      }).then(() => {
        cy.login('teacher', 'password')
        cy.visit('/premium')
      })
      cy.get('#purchase-btn').click()
    })

    it('and click my associated credit card it gives me the option to buy now', ()=>{
      cy.get('.extant-card').click()
      cy.get('.button').contains('Buy Now')
    })

    it('gives me a premium confirmation if I click buy now', ()=>{
      cy.get('.button').click()
      cy.get('.premium-confirmation')
    })
  })
})
