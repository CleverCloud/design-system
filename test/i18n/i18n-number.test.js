import { expect } from '@bundled-es-modules/chai';
import { prepareNumberBytesFormatter, prepareNumberUnitFormatter } from '../../src/lib/i18n/i18n-number.js';

describe('prepareNumberUnitFormatter', () => {
  describe('english', () => {
    const formatNumberUnit = prepareNumberUnitFormatter('en');

    it('Small values', () => {
      expect(formatNumberUnit(0)).to.equal('0');
      expect(formatNumberUnit(1)).to.equal('1');
      expect(formatNumberUnit(10)).to.equal('10');
      expect(formatNumberUnit(100)).to.equal('100');
    });

    it('K values', () => {
      expect(formatNumberUnit(10e2)).to.equal('1k');
      expect(formatNumberUnit(10e3)).to.equal('10k');
      expect(formatNumberUnit(10e4)).to.equal('100k');
    });

    it('M values', () => {
      expect(formatNumberUnit(10e5)).to.equal('1M');
      expect(formatNumberUnit(10e6)).to.equal('10M');
      expect(formatNumberUnit(10e7)).to.equal('100M');
    });

    it('G values', () => {
      expect(formatNumberUnit(10e8)).to.equal('1G');
      expect(formatNumberUnit(10e9)).to.equal('10G');
      expect(formatNumberUnit(10e10)).to.equal('100G');
    });

    it('T values', () => {
      expect(formatNumberUnit(10e11)).to.equal('1T');
      expect(formatNumberUnit(10e12)).to.equal('10T');
      expect(formatNumberUnit(10e13)).to.equal('100T');
    });

    it('P values', () => {
      expect(formatNumberUnit(10e14)).to.equal('1P');
      expect(formatNumberUnit(10e15)).to.equal('10P');
      expect(formatNumberUnit(10e16)).to.equal('100P');
    });

    it('decimal values', () => {
      expect(formatNumberUnit(999)).to.equal('999');
      expect(formatNumberUnit(1049)).to.equal('1k');
      expect(formatNumberUnit(1050)).to.equal('1.1k');
      expect(formatNumberUnit(2149999)).to.equal('2.1M');
      expect(formatNumberUnit(2150000)).to.equal('2.2M');
      expect(formatNumberUnit(3249999999)).to.equal('3.2G');
      expect(formatNumberUnit(3250000000)).to.equal('3.3G');
    });
  });

  describe('french', () => {
    const formatNumberUnit = prepareNumberUnitFormatter('fr');

    it('Small values', () => {
      expect(formatNumberUnit(0)).to.equal('0');
      expect(formatNumberUnit(1)).to.equal('1');
      expect(formatNumberUnit(10)).to.equal('10');
      expect(formatNumberUnit(100)).to.equal('100');
    });

    it('K values', () => {
      expect(formatNumberUnit(10e2)).to.equal('1k');
      expect(formatNumberUnit(10e3)).to.equal('10k');
      expect(formatNumberUnit(10e4)).to.equal('100k');
    });

    it('M values', () => {
      expect(formatNumberUnit(10e5)).to.equal('1M');
      expect(formatNumberUnit(10e6)).to.equal('10M');
      expect(formatNumberUnit(10e7)).to.equal('100M');
    });

    it('G values', () => {
      expect(formatNumberUnit(10e8)).to.equal('1G');
      expect(formatNumberUnit(10e9)).to.equal('10G');
      expect(formatNumberUnit(10e10)).to.equal('100G');
    });

    it('T values', () => {
      expect(formatNumberUnit(10e11)).to.equal('1T');
      expect(formatNumberUnit(10e12)).to.equal('10T');
      expect(formatNumberUnit(10e13)).to.equal('100T');
    });

    it('P values', () => {
      expect(formatNumberUnit(10e14)).to.equal('1P');
      expect(formatNumberUnit(10e15)).to.equal('10P');
      expect(formatNumberUnit(10e16)).to.equal('100P');
    });

    it('decimal values', () => {
      expect(formatNumberUnit(999)).to.equal('999');
      expect(formatNumberUnit(1049)).to.equal('1k');
      expect(formatNumberUnit(1050)).to.equal('1,1k');
      expect(formatNumberUnit(2149999)).to.equal('2,1M');
      expect(formatNumberUnit(2150000)).to.equal('2,2M');
      expect(formatNumberUnit(3249999999)).to.equal('3,2G');
      expect(formatNumberUnit(3250000000)).to.equal('3,3G');
    });
  });
});

describe('prepareNumberBytesFormatter', () => {
  describe('english', () => {
    const formatBytes = prepareNumberBytesFormatter('en', 'B', ' ');

    it('Small values', () => {
      expect(formatBytes(0)).to.equal('0 B');
      expect(formatBytes(1)).to.equal('1 B');
      expect(formatBytes(10)).to.equal('10 B');
      expect(formatBytes(100)).to.equal('100 B');
      expect(formatBytes(1000)).to.equal('1,000 B');
      expect(formatBytes(1023)).to.equal('1,023 B');
    });

    it('k values', () => {
      expect(formatBytes(1024 ** 1 * 1)).to.equal('1 KiB');
      expect(formatBytes(1024 ** 1 * 10)).to.equal('10 KiB');
      expect(formatBytes(1024 ** 1 * 100)).to.equal('100 KiB');
      expect(formatBytes(1024 ** 1 * 1000)).to.equal('1,000 KiB');
      expect(formatBytes(1024 ** 1 * 1023)).to.equal('1,023 KiB');
    });

    it('M values', () => {
      expect(formatBytes(1024 ** 2 * 1)).to.equal('1 MiB');
      expect(formatBytes(1024 ** 2 * 10)).to.equal('10 MiB');
      expect(formatBytes(1024 ** 2 * 100)).to.equal('100 MiB');
      expect(formatBytes(1024 ** 2 * 1000)).to.equal('1,000 MiB');
      expect(formatBytes(1024 ** 2 * 1023)).to.equal('1,023 MiB');
    });

    it('G values', () => {
      expect(formatBytes(1024 ** 3 * 1)).to.equal('1 GiB');
      expect(formatBytes(1024 ** 3 * 10)).to.equal('10 GiB');
      expect(formatBytes(1024 ** 3 * 100)).to.equal('100 GiB');
      expect(formatBytes(1024 ** 3 * 1000)).to.equal('1,000 GiB');
      expect(formatBytes(1024 ** 3 * 1023)).to.equal('1,023 GiB');
    });

    it('T values', () => {
      expect(formatBytes(1024 ** 4 * 1)).to.equal('1 TiB');
      expect(formatBytes(1024 ** 4 * 10)).to.equal('10 TiB');
      expect(formatBytes(1024 ** 4 * 100)).to.equal('100 TiB');
      expect(formatBytes(1024 ** 4 * 1000)).to.equal('1,000 TiB');
      expect(formatBytes(1024 ** 4 * 1023)).to.equal('1,023 TiB');
    });

    it('P values', () => {
      expect(formatBytes(1024 ** 5 * 1)).to.equal('1 PiB');
      expect(formatBytes(1024 ** 5 * 10)).to.equal('10 PiB');
      expect(formatBytes(1024 ** 5 * 100)).to.equal('100 PiB');
      expect(formatBytes(1024 ** 5 * 1000)).to.equal('1,000 PiB');
      expect(formatBytes(1024 ** 5 * 1023)).to.equal('1,023 PiB');
      expect(formatBytes(1024 ** 6 * 10000)).to.equal('10,240,000 PiB');
    });

    it('1 decimal', () => {
      expect(formatBytes(0, 1)).to.equal('0 B');
      expect(formatBytes(1, 1)).to.equal('1 B');
      expect(formatBytes(10, 1)).to.equal('10 B');
      expect(formatBytes(100, 1)).to.equal('100 B');
      expect(formatBytes(1000, 1)).to.equal('1,000 B');
      expect(formatBytes(1024 ** 2 - 1, 1)).to.equal('1,023.9 KiB');
      expect(formatBytes(1024 ** 2 + 1, 1)).to.equal('1.0 MiB');
      expect(formatBytes(1024 ** 3 - 1, 1)).to.equal('1,023.9 MiB');
      expect(formatBytes(1024 ** 3 + 1, 1)).to.equal('1.0 GiB');
      expect(formatBytes(1024 ** 4 - 1, 1)).to.equal('1,023.9 GiB');
      expect(formatBytes(1024 ** 4 + 1, 1)).to.equal('1.0 TiB');
      expect(formatBytes(1024 ** 5 - 1, 1)).to.equal('1,023.9 TiB');
      expect(formatBytes(1024 ** 5 + 1, 1)).to.equal('1.0 PiB');
    });

    it('2 decimals', () => {
      expect(formatBytes(0, 2)).to.equal('0 B');
      expect(formatBytes(1, 2)).to.equal('1 B');
      expect(formatBytes(10, 2)).to.equal('10 B');
      expect(formatBytes(100, 2)).to.equal('100 B');
      expect(formatBytes(1000, 2)).to.equal('1,000 B');
      expect(formatBytes(1024 ** 2 - 1, 2)).to.equal('1,023.99 KiB');
      expect(formatBytes(1024 ** 2 + 1, 2)).to.equal('1.00 MiB');
      expect(formatBytes(1024 ** 3 - 1, 2)).to.equal('1,023.99 MiB');
      expect(formatBytes(1024 ** 3 + 1, 2)).to.equal('1.00 GiB');
      expect(formatBytes(1024 ** 4 - 1, 2)).to.equal('1,023.99 GiB');
      expect(formatBytes(1024 ** 4 + 1, 2)).to.equal('1.00 TiB');
      expect(formatBytes(1024 ** 5 - 1, 2)).to.equal('1,023.99 TiB');
      expect(formatBytes(1024 ** 5 + 1, 2)).to.equal('1.00 PiB');
    });
  });

  describe('french', () => {
    const formatBytes = prepareNumberBytesFormatter('fr', 'o', '\u202f');

    it('Small values', () => {
      expect(formatBytes(0)).to.equal('0\u202fo');
      expect(formatBytes(1)).to.equal('1\u202fo');
      expect(formatBytes(10)).to.equal('10\u202fo');
      expect(formatBytes(100)).to.equal('100\u202fo');
      expect(formatBytes(1000)).to.equal('1 000\u202fo');
      expect(formatBytes(1023)).to.equal('1 023\u202fo');
    });

    it('K values', () => {
      expect(formatBytes(1024 ** 1 * 1)).to.equal('1\u202fKio');
      expect(formatBytes(1024 ** 1 * 10)).to.equal('10\u202fKio');
      expect(formatBytes(1024 ** 1 * 100)).to.equal('100\u202fKio');
      expect(formatBytes(1024 ** 1 * 1000)).to.equal('1 000\u202fKio');
      expect(formatBytes(1024 ** 1 * 1023)).to.equal('1 023\u202fKio');
    });

    it('M values', () => {
      expect(formatBytes(1024 ** 2 * 1)).to.equal('1\u202fMio');
      expect(formatBytes(1024 ** 2 * 10)).to.equal('10\u202fMio');
      expect(formatBytes(1024 ** 2 * 100)).to.equal('100\u202fMio');
      expect(formatBytes(1024 ** 2 * 1000)).to.equal('1 000\u202fMio');
      expect(formatBytes(1024 ** 2 * 1023)).to.equal('1 023\u202fMio');
    });

    it('G values', () => {
      expect(formatBytes(1024 ** 3 * 1)).to.equal('1\u202fGio');
      expect(formatBytes(1024 ** 3 * 10)).to.equal('10\u202fGio');
      expect(formatBytes(1024 ** 3 * 100)).to.equal('100\u202fGio');
      expect(formatBytes(1024 ** 3 * 1000)).to.equal('1 000\u202fGio');
      expect(formatBytes(1024 ** 3 * 1023)).to.equal('1 023\u202fGio');
    });

    it('T values', () => {
      expect(formatBytes(1024 ** 4 * 1)).to.equal('1\u202fTio');
      expect(formatBytes(1024 ** 4 * 10)).to.equal('10\u202fTio');
      expect(formatBytes(1024 ** 4 * 100)).to.equal('100\u202fTio');
      expect(formatBytes(1024 ** 4 * 1000)).to.equal('1 000\u202fTio');
      expect(formatBytes(1024 ** 4 * 1023)).to.equal('1 023\u202fTio');
    });

    it('P values', () => {
      expect(formatBytes(1024 ** 5 * 1)).to.equal('1\u202fPio');
      expect(formatBytes(1024 ** 5 * 10)).to.equal('10\u202fPio');
      expect(formatBytes(1024 ** 5 * 100)).to.equal('100\u202fPio');
      expect(formatBytes(1024 ** 5 * 1000)).to.equal('1 000\u202fPio');
      expect(formatBytes(1024 ** 5 * 1023)).to.equal('1 023\u202fPio');
      expect(formatBytes(1024 ** 6 * 10000)).to.equal('10 240 000\u202fPio');
    });

    it('1 decimal', () => {
      expect(formatBytes(0, 1)).to.equal('0\u202fo');
      expect(formatBytes(1, 1)).to.equal('1\u202fo');
      expect(formatBytes(10, 1)).to.equal('10\u202fo');
      expect(formatBytes(100, 1)).to.equal('100\u202fo');
      expect(formatBytes(1000, 1)).to.equal('1 000\u202fo');
      expect(formatBytes(1024 ** 2 - 1, 1)).to.equal('1 023,9\u202fKio');
      expect(formatBytes(1024 ** 2 + 1, 1)).to.equal('1,0\u202fMio');
      expect(formatBytes(1024 ** 3 - 1, 1)).to.equal('1 023,9\u202fMio');
      expect(formatBytes(1024 ** 3 + 1, 1)).to.equal('1,0\u202fGio');
      expect(formatBytes(1024 ** 4 - 1, 1)).to.equal('1 023,9\u202fGio');
      expect(formatBytes(1024 ** 4 + 1, 1)).to.equal('1,0\u202fTio');
      expect(formatBytes(1024 ** 5 - 1, 1)).to.equal('1 023,9\u202fTio');
      expect(formatBytes(1024 ** 5 + 1, 1)).to.equal('1,0\u202fPio');
    });

    it('2 decimals', () => {
      expect(formatBytes(0, 2)).to.equal('0\u202fo');
      expect(formatBytes(1, 2)).to.equal('1\u202fo');
      expect(formatBytes(10, 2)).to.equal('10\u202fo');
      expect(formatBytes(100, 2)).to.equal('100\u202fo');
      expect(formatBytes(1000, 2)).to.equal('1 000\u202fo');
      expect(formatBytes(1024 ** 2 - 1, 2)).to.equal('1 023,99\u202fKio');
      expect(formatBytes(1024 ** 2 + 1, 2)).to.equal('1,00\u202fMio');
      expect(formatBytes(1024 ** 3 - 1, 2)).to.equal('1 023,99\u202fMio');
      expect(formatBytes(1024 ** 3 + 1, 2)).to.equal('1,00\u202fGio');
      expect(formatBytes(1024 ** 4 - 1, 2)).to.equal('1 023,99\u202fGio');
      expect(formatBytes(1024 ** 4 + 1, 2)).to.equal('1,00\u202fTio');
      expect(formatBytes(1024 ** 5 - 1, 2)).to.equal('1 023,99\u202fTio');
      expect(formatBytes(1024 ** 5 + 1, 2)).to.equal('1,00\u202fPio');
    });
  });
});
