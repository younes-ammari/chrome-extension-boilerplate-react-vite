describe('Content UI Injection', () => {
  it('should locate the injected content UI div', async () => {
    await browser.url('https://www.example.com');

    const contentDiv = await $('#copyable-extension-content-view-root').getElement();
    await expect(contentDiv).toBeDisplayed();
  });
});
