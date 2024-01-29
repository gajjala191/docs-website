const { validateSteps, validateTabs } = require('../validators');
const ERROR_TYPES = require('../error-types');
const { createAST } = require('../../../mdx-utils/mdxast');

describe('validateSteps', () => {
  it('should return an error with non <Step> children', () => {
    const mdx = `# here are some steps!

we should catch paragraph text inside Steps

<Steps>
  <Step>hiiii</Step>
  <Step>step 2</Step>

  bad paragraph child

  <Step>step 4!</Step>
</Steps>

we should also catch non-Step MDX elements

<Steps>
  <Step>hiiii</Step>
  <Callout>bad callout</Callout>
  <Step>step 2</Step>
  <Step>step 4!</Step>
</Steps>`;

    const ast = createAST(mdx);
    const errors = validateSteps(ast);
    expect(errors.length).toBe(2);

    const [paragraphError, calloutError] = errors;

    expect(paragraphError.type).toBe(ERROR_TYPES.VALIDATION_ERROR);
    expect(paragraphError.line).toBe(9);
    expect(paragraphError.reason).toBe(
      '<Steps> component must only contain <Step> components as immediate children but found "bad paragraph child"'
    );

    expect(calloutError.type).toBe(ERROR_TYPES.VALIDATION_ERROR);
    expect(calloutError.line).toBe(18);
    expect(calloutError.reason).toBe(
      '<Steps> component must only contain <Step> components as immediate children but found <Callout>'
    );
  });

  it('should not return an error with only <Step> children', () => {
    const mdx = `# here are some steps!
<Steps>
  <Step>hiiii</Step>
  <Step>step 2</Step>
  <Step>step 3</Step>
  <Step>step 4!</Step>
</Steps>`;

    const ast = createAST(mdx);
    const errors = validateSteps(ast);
    expect(errors.length).toBe(0);
  });
});

describe('validateTabs', () => {
  it('should return an error with non <TabsBar> or <TabsPages> children', () => {
    const mdx = `# here are some tabs!

we should catch paragaph text inside Tabs

<Tabs>
  <TabsBar>
    <TabsBarItem id="tab-1">tab 1</TabsBarItem>
    <TabsBarItem id="tab-2">tab 2</TabsBarItem>
  </TabsBar>

  bad paragraph child

  <TabsPages>
    <TabsPageItem id="tab-1">first content</TabsPageItem>
    <TabsPageItem id="tab-2">but what about second content?</TabsPageItem>
  </TabsPages>
</Tabs>

we should also catch MDX elements

<Tabs>
  <TabsBar>
    <TabsBarItem id="tab-1">tab 1</TabsBarItem>
    <TabsBarItem id="tab-2">tab 2</TabsBarItem>
  </TabsBar>
  <Callout>bad child</Callout>
  <TabsPages>
    <TabsPageItem id="tab-1">first content</TabsPageItem>
    <TabsPageItem id="tab-2">but what about second content?</TabsPageItem>
  </TabsPages>
</Tabs>
`;

    const ast = createAST(mdx);
    const errors = validateTabs(ast);
    expect(errors.length).toBe(2);
    const [paragraphError, calloutError] = errors;
    expect(paragraphError.type).toBe(ERROR_TYPES.VALIDATION_ERROR);
    expect(paragraphError.line).toBe(11);
    expect(paragraphError.reason).toBe(
      '<Tabs> component must only contain <TabsBar> and <TabsPages> components as immediate children but found "bad paragraph child"'
    );
    expect(calloutError.type).toBe(ERROR_TYPES.VALIDATION_ERROR);
    expect(calloutError.line).toBe(26);
    expect(calloutError.reason).toBe(
      '<Tabs> component must only contain <TabsBar> and <TabsPages> components as immediate children but found <Callout>'
    );
  });

  it('should not return an error with only <TabsBar> and <TabsPages> children', () => {
    const mdx = `# here are some tabs!
<Tabs>
  <TabsBar>
    <TabsBarItem id="tab-1">tab 1</TabsBarItem>
    <TabsBarItem id="tab-2">tab 2</TabsBarItem>
  </TabsBar>
  <TabsPages>
    <TabsPageItem id="tab-1">first content</TabsPageItem>
    <TabsPageItem id="tab-2">but what about second content?</TabsPageItem>
  </TabsPages>
</Tabs>`;

    const ast = createAST(mdx);
    const errors = validateTabs(ast);
    expect(errors.length).toBe(0);
  });

  it('should return an error with mismatching <TabsBarItem>s and <TabsPageItem>s', () => {
    const mdx = `# here are some tabs!
<Tabs>
  <TabsBar>
    <TabsBarItem id="tab-1">tab 1</TabsBarItem>
    <TabsBarItem id="tab-2">this id doesn't have a matching TabsPageItem</TabsBarItem>
  </TabsBar>
  <TabsPages>
    <TabsPageItem id="tab-1">first content</TabsPageItem>
    <TabsPageItem id="bad-tab-2">this id doesn't match its TabsBarItem</TabsPageItem>
  </TabsPages>
</Tabs>`;

    const ast = createAST(mdx);
    const errors = validateTabs(ast);
    expect(errors.length).toBe(2);
    const [barItemError, pageItemError] = errors;
    expect(barItemError.type).toBe(ERROR_TYPES.VALIDATION_ERROR);
    expect(pageItemError.type).toBe(ERROR_TYPES.VALIDATION_ERROR);
    expect(barItemError.line).toBe(5);
    expect(pageItemError.line).toBe(9);
  });

  it('should return an error if <TabsBarItem>s have duplicate ids', () => {
    const mdx = `# here are some tabs!
<Tabs>
  <TabsBar>
    <TabsBarItem id="tab-1">tab 1</TabsBarItem>
    <TabsBarItem id="tab-2">tab 2</TabsBarItem>
    <TabsBarItem id="tab-1">this id is a duplicate</TabsBarItem>
  </TabsBar>
  <TabsPages>
    <TabsPageItem id="tab-1">first content</TabsPageItem>
    <TabsPageItem id="tab-2">but what about second content?</TabsPageItem>
  </TabsPages>
</Tabs>`;

    const ast = createAST(mdx);
    const errors = validateTabs(ast);
    expect(errors.length).toBe(1);
    expect(errors[0].line).toBe(6);
    expect(errors[0].type).toBe(ERROR_TYPES.VALIDATION_ERROR);
  });

  it('should return an error if <TabsPageItem>s have duplicate ids', () => {
    const mdx = `# here are some tabs!
<Tabs>
  <TabsBar>
    <TabsBarItem id="tab-1">tab 1</TabsBarItem>
    <TabsBarItem id="tab-2">tab 2</TabsBarItem>
  </TabsBar>
  <TabsPages>
    <TabsPageItem id="tab-1">first content</TabsPageItem>
    <TabsPageItem id="tab-1">this id is a duplicate</TabsPageItem>
    <TabsPageItem id="tab-2">but what about second content?</TabsPageItem>
  </TabsPages>
</Tabs>`;

    const ast = createAST(mdx);
    const errors = validateTabs(ast);
    expect(errors.length).toBe(1);
    expect(errors[0].line).toBe(9);
    expect(errors[0].type).toBe(ERROR_TYPES.VALIDATION_ERROR);
  });
});
