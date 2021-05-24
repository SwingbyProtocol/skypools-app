(() => {
  const testCases = ({ width, height, name }: { width: number; height: number; name: string }) => {
    beforeEach(() => {
      cy.viewport(width, height);
    });

    it('renders landing page correctly', () => {
      cy.visit('/');
      cy.percySnapshot(`${name}: landing page`, { widths: [width] });
    });
  };

  describe('Narrow', () => {
    testCases({ width: 320, height: 1400, name: 'Narrow' });
  });

  describe('Medium', () => {
    testCases({ width: 768, height: 1400, name: 'Medium' });
  });

  describe('Wide', () => {
    testCases({ width: 1400, height: 1400, name: 'Wide' });
  });
})();
