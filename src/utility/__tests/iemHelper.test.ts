import iemHelper from '../iemHelper';
import { convectiveRisk } from '../iemHelper';
import 'should';

describe('iemHelper', () => {
  describe('condenseSPCOutlooks', () => {
    const day = '1';
    const cwa = 'MPX';

    const baseEvents: any = [
      { details: { code: 'test1' }},
      { details: { code: 'test2' }},
    ];

    const multipleEvents = [
      { details: { code: 'test1' }},
      { details: { code: 'pts', text: `The Storm Prediction Center issues Day ${day} Convective Risk for portions of ${cwa}'s area` }},
      { details: { code: 'pts', text: `The Storm Prediction Center issues Day ${day} Convective Risk for portions of ${cwa}'s area` }},
      { details: { code: 'test1' }},
    ];

    it('should return the same array passed in if no PTS events present', () => {
      const result = iemHelper.condenseSPCOutlooks(baseEvents);
      result.should.be.deepEqual(baseEvents);
    });

    it('should condense multiple PTS events into a single event', () => {
      const ptsEventCount = multipleEvents.filter(x => x.details.code === 'pts').length;
      const expectedLength = multipleEvents.length - (ptsEventCount - 1);
      const result = iemHelper.condenseSPCOutlooks(multipleEvents);
      result.length.should.equal(expectedLength);
    });

    it ('should insert a condensed PTS event at the index of the first PTS event', () => {
      const result = iemHelper.condenseSPCOutlooks(multipleEvents);
      result[1].details.code.should.equal('pts');
    });

    it ('should parse the day from the condensed PTS events and persist it into the new event', () => {
      const result = iemHelper.condenseSPCOutlooks(multipleEvents);
      result[1].details.text.indexOf(`Day ${day}`).should.not.equal(-1);
    });

    // Parameterized tests for each of the risk types
    const parameterizedEvents = [];
    Object.keys(convectiveRisk).forEach((key) => {
      it(`should display '${key}' when ${key} is the highest risk present`, () => {
        const text = key === convectiveRisk.None
          ? `The Storm Prediction Center issues Day ${day} Convective Risk`
          : `The Storm Prediction Center issues Day ${day} Convective ${key} Risk for portions of ${cwa}'s area`;
        const expectedText = key === convectiveRisk.None
          ? `The SPC issues Day ${day} Convective Risk: No thunderstorm areas forecast`
          : `The SPC issues Day ${day} ${key} Convective Risk for portions of: ${cwa}`;
        parameterizedEvents.push({ details: { code: 'pts', text } });
        const result = iemHelper.condenseSPCOutlooks(parameterizedEvents);
        result[0].details.text.should.equal(expectedText);
      });
    });
  });
});
