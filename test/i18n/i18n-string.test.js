import { expect } from '@bundled-es-modules/chai';
import { preparePlural } from '../../src/lib/i18n/i18n-string.js';

describe('preparePlural', () => {
  describe('english', () => {
    const plural = preparePlural('en');

    it('select correct rule', () => {
      expect(plural(0, 'mouse', 'mice')).to.equal('mice');
      expect(plural(1, 'mouse', 'mice')).to.equal('mouse');
      expect(plural(2, 'mouse', 'mice')).to.equal('mice');
      expect(plural(10, 'mouse', 'mice')).to.equal('mice');
    });

    it('automatic "s" suffix', () => {
      expect(plural(0, 'cat')).to.equal('cats');
      expect(plural(1, 'cat')).to.equal('cat');
      expect(plural(2, 'cat')).to.equal('cats');
      expect(plural(10, 'cat')).to.equal('cats');
    });
  });

  describe('french', () => {
    const plural = preparePlural('fr');

    it('select correct rule', () => {
      expect(plural(0, 'cheval', 'chevaux')).to.equal('cheval');
      expect(plural(1, 'cheval', 'chevaux')).to.equal('cheval');
      expect(plural(2, 'cheval', 'chevaux')).to.equal('chevaux');
      expect(plural(10, 'cheval', 'chevaux')).to.equal('chevaux');
    });

    it('automatic "s" suffix', () => {
      expect(plural(0, 'chat')).to.equal('chat');
      expect(plural(1, 'chat')).to.equal('chat');
      expect(plural(2, 'chat')).to.equal('chats');
      expect(plural(10, 'chat')).to.equal('chats');
    });
  });
});
