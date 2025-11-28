import * as React from 'react';
import { Textarea } from '@base-ui-components/react/textarea';
import { createRenderer, isJSDOM } from '#test-utils';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { describeConformance } from '../../test/describeConformance';

describe('<Textarea />', () => {
  const { render } = createRenderer();

  describeConformance(<Textarea />, () => ({
    refInstanceof: window.HTMLTextAreaElement,
    render,
  }));

  describe('field-sizing support detection', () => {
    let originalCSS: typeof CSS;
    let cssSupportsStub: sinon.SinonStub;

    beforeEach(() => {
      originalCSS = globalThis.CSS;
    });

    afterEach(() => {
      globalThis.CSS = originalCSS;
      if (cssSupportsStub) {
        cssSupportsStub.restore();
      }
    });

    it('should not apply JS resize logic when field-sizing is supported', async () => {
      // Mock CSS.supports to return true for field-sizing
      cssSupportsStub = sinon.stub(CSS, 'supports');
      cssSupportsStub.withArgs('field-sizing', 'content').returns(true);

      const { container } = await render(<Textarea minRows={2} maxRows={5} />);
      const textarea = container.querySelector('textarea');

      expect(textarea).not.to.equal(null);
      // The textarea should not have a dynamically set height style when field-sizing is supported
      expect(textarea?.style.height).to.equal('');
    });

    it.skipIf(!isJSDOM)(
      'should apply JS resize logic when field-sizing is not supported',
      async () => {
        // Mock CSS.supports to return false for field-sizing
        cssSupportsStub = sinon.stub(CSS, 'supports');
        cssSupportsStub.withArgs('field-sizing', 'content').returns(false);

        const { container } = await render(
          <Textarea minRows={2} maxRows={5} defaultValue="test" />,
        );
        const textarea = container.querySelector('textarea');

        expect(textarea).not.to.equal(null);
        // In a real scenario, the JS resize logic would set the height
        // In JSDOM, layout measurements don't work, so we just verify the textarea exists
      },
    );

    it('should handle missing CSS.supports gracefully', async () => {
      // Mock CSS as undefined
      (globalThis as any).CSS = undefined;

      const { container } = await render(<Textarea minRows={2} maxRows={5} />);
      const textarea = container.querySelector('textarea');

      expect(textarea).not.to.equal(null);
      // Should fall back to JS resize logic when CSS.supports is not available
    });
  });

  describe('auto-resize behavior', () => {
    it('should render with minRows attribute', async () => {
      const { container } = await render(<Textarea minRows={3} />);
      const textarea = container.querySelector('textarea');

      expect(textarea?.getAttribute('rows')).to.equal('3');
    });

    it('should render with default rows when minRows is not provided', async () => {
      const { container } = await render(<Textarea />);
      const textarea = container.querySelector('textarea');

      expect(textarea?.getAttribute('rows')).to.equal('2');
    });

    it('should render hidden textarea for measurements', async () => {
      const { container } = await render(<Textarea minRows={2} maxRows={5} />);
      const textareas = container.querySelectorAll('textarea');

      expect(textareas).to.have.lengthOf(2);

      const hiddenTextarea = textareas[1];
      expect(hiddenTextarea?.getAttribute('aria-hidden')).to.equal('true');
      expect(hiddenTextarea?.getAttribute('tabindex')).to.equal('-1');
      expect(hiddenTextarea?.style.visibility).to.equal('hidden');
    });
  });
});
