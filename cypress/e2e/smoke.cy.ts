describe('Smoke', () => {
  it('app loads', () => {
    cy.visit('/');
    cy.get('[data-testid="navbar"]').should('be.visible');
    cy.get('[data-testid="world-map"]').should('be.visible');
  });
});
