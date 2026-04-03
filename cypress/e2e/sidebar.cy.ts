// ISS-008: Sidebar test suite
// Seeds 3 notes on the home page before each test.

describe('Sidebar', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.addNote({ title: 'Note 1', text: 'Text 1', country: 'Japan' });
    cy.addNote({ title: 'Note 2', text: 'Text 2', country: 'France' });
    cy.addNote({ title: 'Note 3', text: 'Text 3', country: 'Brazil' });
  });

  it('1 — Recent notes shown', () => {
    cy.get('[data-testid="sidebar"]').should('be.visible');
    cy.get('[data-testid="sidebar-note-card"]').should('have.length', 3);
  });

  it('2 — Toggle to random', () => {
    // Notes are added newest-first so "recent" order is Note 3 → Note 2 → Note 1.
    // Verify initial recent order then switch to random and back.
    cy.get('[data-testid="sidebar-note-card"]').first().should('contain', 'Note 3');

    // Click the Random tab
    cy.get('[data-testid="sidebar"]').contains('Random').click();
    // Cards are still all shown regardless of random order
    cy.get('[data-testid="sidebar-note-card"]').should('have.length', 3);

    // Switching back to Recent restores deterministic order
    cy.get('[data-testid="sidebar"]').contains('Recent').click();
    cy.get('[data-testid="sidebar-note-card"]').first().should('contain', 'Note 3');
  });

  it('3 — View all navigates', () => {
    // "View All" only renders when totalNotes > 5; add 3 more to cross the threshold.
    cy.addNote({ title: 'Note 4', text: 'Text 4', country: 'Germany' });
    cy.addNote({ title: 'Note 5', text: 'Text 5', country: 'Italy' });
    cy.addNote({ title: 'Note 6', text: 'Text 6', country: 'Spain' });

    cy.get('[data-testid="sidebar"]').contains('View All').click();
    cy.url().should('include', '/all-notes');
  });

  it('4 — Edit from sidebar', () => {
    // Clicking a sidebar card opens the edit dialog pre-filled with that note's data.
    cy.get('[data-testid="sidebar-note-card"]').first().click();
    cy.get('[data-testid="note-dialog"]').should('be.visible');
    cy.get('[data-testid="note-dialog-title"]').find('input').should('not.have.value', '');
  });

  it('5 — Delete from sidebar', () => {
    cy.get('[data-testid="sidebar-note-card"]').should('have.length', 3);

    cy.get('[data-testid="btn-delete-note"]').first().click();
    cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');
    cy.get('[data-testid="btn-delete-confirm"]').click();

    cy.get('[data-testid="sidebar-note-card"]').should('have.length', 2);
  });
});
