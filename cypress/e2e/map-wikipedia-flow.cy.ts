// ISS-005: Map & Wikipedia flow test suite
// All Wikipedia API calls are intercepted — no real network requests are made.

describe('Map & Wikipedia Flow', () => {
  beforeEach(() => {
    // Intercept both Wikipedia API legs with fixtures
    cy.intercept('GET', '**/api.php?*list=search*', {
      fixture: 'wikipedia-search.json',
    }).as('wikiSearch');
    cy.intercept('GET', '**/api.php?*prop=extracts*', {
      fixture: 'wikipedia-article.json',
    }).as('wikiArticle');

    cy.visit('/');
  });

  it('1 — page renders map and navbar', () => {
    cy.get('[data-testid="navbar"]').should('be.visible');
    cy.get('[data-testid="world-map"]').should('be.visible');
  });

  it('2 — clicking a country opens the drawer', () => {
    cy.get('[data-testid="world-map"] svg path').first().click({ force: true });
    cy.get('[data-testid="wikipedia-drawer"]').should('be.visible');
  });

  it('3 — drawer populates with article title after API resolves', () => {
    cy.get('[data-testid="world-map"] svg path').first().click({ force: true });
    cy.wait('@wikiSearch');
    cy.wait('@wikiArticle');
    cy.get('[data-testid="drawer-article-title"]').should(
      'contain',
      'History of Japan',
    );
  });

  it('4 — reload button fires both API calls again', () => {
    cy.get('[data-testid="world-map"] svg path').first().click({ force: true });
    cy.wait('@wikiSearch');
    cy.wait('@wikiArticle');

    cy.get('[data-testid="btn-drawer-reload"]').click();
    cy.wait('@wikiSearch');
    cy.wait('@wikiArticle');
  });

  it('5 — close button hides the drawer', () => {
    cy.get('[data-testid="world-map"] svg path').first().click({ force: true });
    // btn-drawer-close is always rendered in the drawer header (even during loading)
    // — use it to confirm the drawer is open without depending on the portal root element
    cy.get('[data-testid="btn-drawer-close"]').should('be.visible');

    cy.get('[data-testid="btn-drawer-close"]').click();
    // MUI Drawer unmounts its children after the exit animation completes
    cy.get('[data-testid="btn-drawer-close"]').should('not.exist');
  });

  it('6 — saving article closes drawer, shows snackbar, and adds note to sidebar', () => {
    cy.get('[data-testid="world-map"] svg path').first().click({ force: true });
    cy.wait('@wikiSearch');
    cy.wait('@wikiArticle');

    // btn-drawer-save only renders once the article has loaded
    cy.get('[data-testid="btn-drawer-save"]').should('be.visible').click();

    // After closing, drawer children are unmounted
    cy.get('[data-testid="btn-drawer-save"]').should('not.exist');
    cy.get('[data-testid="success-snackbar"]').should('be.visible');
    cy.get('[data-testid="sidebar-note-card"]').should('have.length.at.least', 1);
  });

  it('7 — Wikipedia API error shows alert inside the drawer', () => {
    // Override the beforeEach intercept with a network error for this test
    cy.intercept('GET', '**/api.php?*list=search*', {
      forceNetworkError: true,
    }).as('wikiSearchError');

    cy.get('[data-testid="world-map"] svg path').first().click({ force: true });
    cy.wait('@wikiSearchError');

    // [role="alert"] is the MUI Alert rendered on error — check it directly
    // (avoids depending on the portal root element which can be unstable post-update)
    cy.get('[role="alert"]').should('be.visible');
  });
});
