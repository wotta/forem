describe('Add tags to article', () => {
  const exampleTopTags = [
    { name: 'tag1' },
    {
      name: 'tag2',
      rules_html:
        '<p>Here are some rules <a href="//www.test.com">link here</a></p>\n',
    },
  ];

  beforeEach(() => {
    cy.testSetup();
    cy.fixture('users/articleEditorV2User.json').as('user');

    cy.get('@user').then((user) => {
      cy.loginAndVisit(user, '/new');
    });
  });

  it('automatically suggests top tags when field is focused', () => {
    cy.intercept('/tags/suggest', exampleTopTags);
    cy.findByRole('textbox', { name: 'Post Tags' }).focus();

    cy.findByRole('button', { name: 'tag1' }).should('exist');
    cy.findByRole('button', {
      name: 'tag2',
    }).should('exist');
  });

  it('automatically suggests top tags again after tag insertion', () => {
    cy.intercept('/tags/suggest', exampleTopTags);
    cy.findByRole('textbox', { name: 'Post Tags' }).clear().type('something,');

    // Search is in progress, top tags which don't match shouldn't be shown
    cy.findByRole('button', { name: 'tag1' }).should('not.exist');
    cy.findByRole('button', {
      name: 'tag2',
    }).should('not.exist');

    // Users initiating fresh search after comma
    cy.findByRole('textbox', { name: 'Post Tags' }).focus();
    cy.findByRole('button', { name: 'tag1' }).should('exist');
    cy.findByRole('button', {
      name: 'tag2',
    }).should('exist');
  });

  it("doesn't suggest top tags already added", () => {
    cy.intercept('/tags/suggest', exampleTopTags);
    cy.findByRole('textbox', { name: 'Post Tags' }).focus();
    cy.findByRole('button', { name: 'tag1' }).click();

    cy.findByRole('button', { name: 'tag1' }).should('not.exist');
    cy.findByRole('button', {
      name: 'tag2',
    }).should('exist');
  });

  // Regression specs for #14867
  it('keeps on suggesting a tag even if we typed in the whole name', () => {
    cy.findByRole('textbox', { name: 'Post Tags' }).clear().type('tag1');

    // Search is in progress, both tags should still be shown
    cy.findByRole('button', { name: 'tag1' }).should('exist');
    cy.findByRole('button', { name: 'tag2' }).should('not.exist');
  });

  it('no longer suggests a tag once it has been entered', () => {
    cy.findByRole('textbox', { name: 'Post Tags' }).clear().type('tag1, ');

    // Search is in progress, but java already added
    cy.findByRole('button', { name: 'tag1' }).should('not.exist');
    cy.findByRole('button', { name: 'tag2' }).should('exist');
  });
});
