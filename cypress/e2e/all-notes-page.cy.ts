// ISS-007: All Notes page test suite
// Seeds 4 notes (Japan x2, France, Germany+tag) then navigates to /all-notes before each test.

// Helper: open a MUI Select (FormControl) by clicking its visible trigger div.
function openSelect(testId: string) {
  cy.get(`[data-testid="${testId}"]`).find('.MuiSelect-select').click();
}

describe('All Notes Page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.addNote({ title: 'Note A', text: 'Content A', country: 'Japan' });
    cy.addNote({ title: 'Note B', text: 'Content B', country: 'France' });
    cy.addNote({ title: 'Note C', text: 'Content C', country: 'Japan' });
    cy.addNote({ title: 'Note D', text: 'Content D', country: 'Germany', tags: ['Ancient History'] });
    cy.get('[data-testid="btn-all-notes"]').click();
  });

  it('1 — Navigate to page', () => {
    cy.url().should('include', '/all-notes');
    cy.get('[data-testid="notes-table"]').should('be.visible');
  });

  it('2 — Notes table renders', () => {
    cy.get('[data-testid="notes-table-row"]').should('have.length', 4);
  });

  it('3 — Search filter', () => {
    cy.get('[data-testid="filter-search"]').find('input').type('Note A');
    cy.get('[data-testid="notes-table-row"]').should('have.length', 1);
    cy.get('[data-testid="notes-table-row"]').should('contain', 'Note A');
  });

  it('4 — Country filter (1-country section view)', () => {
    // Switch to single-country split view — pick Japan
    openSelect('filter-country');
    cy.get('[role="listbox"]').contains('Display notes for 1 country').click();

    cy.get('[data-testid="filter-controls"] .MuiAutocomplete-root')
      .eq(0)
      .find('input')
      .type('Japan');
    cy.get('.MuiAutocomplete-listbox').contains('Japan').click();

    // Notes A and C are Japan notes → 2 rows
    cy.get('[data-testid="notes-table-row"]').should('have.length', 2);
    cy.get('[data-testid="notes-table-row"]').each(($row) => {
      cy.wrap($row).should('contain', 'Note');
    });
  });

  it('5 — Tag filter', () => {
    // Note D was seeded with "Ancient History" — only it should match
    openSelect('filter-tag');
    cy.get('[role="listbox"]').contains('Ancient History').click();

    cy.get('[data-testid="notes-table-row"]').should('have.length', 1);
    cy.get('[data-testid="notes-table-row"]').should('contain', 'Note D');
  });

  it('6 — Sort by oldest', () => {
    // Default is newest-first. Switch to oldest — Note A must be first.
    openSelect('filter-sort');
    cy.get('[role="listbox"]').contains('Oldest First').click();

    cy.get('[data-testid="notes-table-row"]').first().should('contain', 'Note A');
  });

  it('7 — Sort by newest', () => {
    // Switch to oldest, then back to newest — Note D (last added) must be first.
    openSelect('filter-sort');
    cy.get('[role="listbox"]').contains('Oldest First').click();

    openSelect('filter-sort');
    cy.get('[role="listbox"]').contains('Newest First').click();

    cy.get('[data-testid="notes-table-row"]').first().should('contain', 'Note D');
  });

  it('8 — Reset filters', () => {
    // Apply a filter to reveal the reset button
    openSelect('filter-sort');
    cy.get('[role="listbox"]').contains('Oldest First').click();

    cy.get('[data-testid="btn-reset-filters"]').should('be.visible').click();

    // All 4 notes back, reset button gone
    cy.get('[data-testid="notes-table-row"]').should('have.length', 4);
    cy.get('[data-testid="btn-reset-filters"]').should('not.exist');
  });

  it('9 — Row click opens edit dialog', () => {
    cy.get('[data-testid="notes-table-row"]').first().click();
    cy.get('[data-testid="note-dialog"]').should('be.visible');

    // Dialog is in edit mode (pre-filled with the note's title)
    cy.get('[data-testid="note-dialog-title"]').find('input').should('not.have.value', '');
  });

  it('10 — Edit note from table', () => {
    cy.get('[data-testid="notes-table-row"]').first().click();
    cy.get('[data-testid="note-dialog-content"]')
      .find('textarea')
      .first()
      .clear()
      .type('Updated content from table test.');
    cy.get('[data-testid="btn-note-dialog-save"]').click();

    cy.get('[data-testid="notes-table-row"]').should('contain', 'Updated content');
  });

  it('11 — Delete note from table', () => {
    cy.get('[data-testid="notes-table-row"]').should('have.length', 4);

    cy.get('[data-testid="btn-delete-note"]').first().click();
    cy.get('[data-testid="delete-confirm-dialog"]').should('be.visible');
    cy.get('[data-testid="btn-delete-confirm"]').click();

    cy.get('[data-testid="notes-table-row"]').should('have.length', 3);
  });

  it('12 — Split view — 2 countries', () => {
    openSelect('filter-country');
    cy.get('[role="listbox"]').contains('Display notes for 2 countries').click();

    // Set Country 1 = Japan
    cy.get('[data-testid="filter-controls"] .MuiAutocomplete-root')
      .eq(0)
      .find('input')
      .type('Japan');
    cy.get('.MuiAutocomplete-listbox').contains('Japan').click();

    // Set Country 2 = France
    cy.get('[data-testid="filter-controls"] .MuiAutocomplete-root')
      .eq(1)
      .find('input')
      .type('France');
    cy.get('.MuiAutocomplete-listbox').contains('France').click();

    // Two separate tables rendered — one per country
    cy.get('[data-testid="notes-table"]').should('have.length', 2);
  });

  it('13 — Empty state', () => {
    cy.get('[data-testid="filter-search"]').find('input').type('xyzzy-no-match');
    cy.contains('No notes found').should('be.visible');
    cy.get('[data-testid="notes-table"]').should('not.exist');
  });
});
