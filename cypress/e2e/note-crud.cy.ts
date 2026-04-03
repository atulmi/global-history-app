// ISS-006: Note CRUD test suite
// Tests cover the full add / edit / delete lifecycle via the Navbar and sidebar.

/** Helper: open the add-note dialog and fill in all required fields. */
function addNote(title: string, content: string, country: string) {
  cy.get('[data-testid="btn-add-note"]').click();
  cy.get('[data-testid="note-dialog-title"]').find('input').type(title);
  cy.get('[data-testid="note-dialog-content"]')
    .find('textarea')
    .first()
    .type(content);
  cy.get('[data-testid="note-dialog-country"]').find('input').type(country);
  cy.get('.MuiAutocomplete-listbox').contains(country).click();
  cy.get('[data-testid="btn-note-dialog-save"]').click();
}

describe('Note CRUD', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('1 — Open add dialog via Navbar', () => {
    cy.get('[data-testid="btn-add-note"]').click();
    cy.get('[data-testid="note-dialog"]').should('be.visible');
  });

  it('2 — Validate required fields', () => {
    cy.get('[data-testid="btn-add-note"]').click();
    // Save button disabled while content and country are empty
    cy.get('[data-testid="btn-note-dialog-save"]').should('be.disabled');
    // Inline validation error is shown for the content field
    cy.get('[data-testid="note-dialog-content"]')
      .closest('.MuiFormControl-root')
      .contains('Content is required')
      .should('be.visible');
  });

  it('3 — Add note successfully', () => {
    addNote('My Test Note', 'Some interesting history content.', 'Japan');
    cy.get('[data-testid="note-dialog"]').should('not.exist');
    cy.get('[data-testid="success-snackbar"]').should('be.visible');
  });

  it('4 — Note appears in sidebar', () => {
    // Start with no notes; count after adding must be 1
    cy.get('[data-testid="sidebar-note-card"]').should('not.exist');
    addNote('Sidebar Note', 'Content for sidebar test.', 'France');
    cy.get('[data-testid="sidebar-note-card"]').should('have.length', 1);
  });

  it('5 — Edit note via sidebar', () => {
    addNote('Original Title', 'Content to be edited.', 'Germany');

    // Click the card to open the edit dialog (NoteCard compact mode is clickable)
    cy.get('[data-testid="sidebar-note-card"]').first().click();
    cy.get('[data-testid="note-dialog"]').should('be.visible');

    // Dialog must be pre-filled with the note's current title
    cy.get('[data-testid="note-dialog-title"]')
      .find('input')
      .should('have.value', 'Original Title');

    // Change the title and save
    cy.get('[data-testid="note-dialog-title"]')
      .find('input')
      .clear()
      .type('Updated Title');
    cy.get('[data-testid="btn-note-dialog-save"]').click();

    // Sidebar card reflects the new title
    cy.get('[data-testid="sidebar-note-card"]')
      .first()
      .should('contain', 'Updated Title');
  });

  it('6 — Delete note — cancel', () => {
    addNote('Note to Keep', 'This note should not be deleted.', 'Italy');
    cy.get('[data-testid="sidebar-note-card"]').should('have.length', 1);

    cy.get('[data-testid="btn-delete-note"]').first().click();
    cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');

    // Cancel — note must remain
    cy.get('[data-testid="delete-confirm-dialog"]').contains('Cancel').click();
    cy.get('[data-testid="sidebar-note-card"]').should('have.length', 1);
  });

  it('7 — Delete note — confirm', () => {
    addNote('Note to Delete', 'This note will be deleted.', 'Spain');
    cy.get('[data-testid="sidebar-note-card"]').should('have.length', 1);

    cy.get('[data-testid="btn-delete-note"]').first().click();
    cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');
    cy.get('[data-testid="btn-delete-confirm"]').click();

    cy.get('[data-testid="sidebar-note-card"]').should('not.exist');
  });
});
