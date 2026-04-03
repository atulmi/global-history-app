// Custom Cypress commands
// See: https://on.cypress.io/custom-commands

declare global {
  namespace Cypress {
    interface Chainable {
      addNote(note: { title: string; text: string; country: string; tags?: string[] }): Chainable<void>;
    }
  }
}

Cypress.Commands.add('addNote', (note: { title: string; text: string; country: string; tags?: string[] }) => {
  cy.get('[data-testid="btn-add-note"]').click();
  cy.get('[data-testid="note-dialog-title"]').type(note.title);
  cy.get('[data-testid="note-dialog-content"]').type(note.text);
  cy.get('[data-testid="note-dialog-country"]').type(note.country).type('{enter}');
  if (note.tags && note.tags.length > 0) {
    for (const tag of note.tags) {
      cy.get('[data-testid="tags-select"]').find('.MuiSelect-select').click();
      cy.get('[role="listbox"]').contains(tag).click();
    }
  }
  cy.get('[data-testid="btn-note-dialog-save"]').click();
  cy.get('[data-testid="success-snackbar"]').should('be.visible');
});

export {};
