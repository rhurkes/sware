import eventsProcessor from '../eventsProcessor';
import userConfig from '../../../config/userConfig';
import swareConfig from '../../../config/swareConfig';
import iemHelper, { IIEMMessageData } from '../../../utility/iemHelper';
import * as sinon from 'sinon';
import 'should';

describe('eventsProcessor', () => {
  const defaultConfig = {
    age: { value: 0 },
    severeMode: { value: false },
  };

  describe('filterEvents', () => {
    const cutoffMinutes = 5;
    const startOfTime = new Date(0);

    it('should not cut off messages newer than 5 minutes if cutoffMinutes is set to 5', () => {
      const now = new Date().setSeconds(60 * (cutoffMinutes - 1));
      const config = {
        age: { value: cutoffMinutes },
        severeMode: {},
      };
      const events = [{ time: now }];
      const result = eventsProcessor.filterEvents(events, config);
      result.should.have.lengthOf(events.length);
    });

    it('should cut off messages older than 5 minutes if cutoffMinutes is set to 5', () => {
      const now = new Date().setSeconds(-60 * (cutoffMinutes + 1));
      const config = {
        age: { value: cutoffMinutes },
        severeMode: {},
      };
      const events = [{ time: now }];
      const result = eventsProcessor.filterEvents(events, config);
      result.should.have.lengthOf(0);
    });

    it('should return all messages regardless of time if age 0 is set', () => {
      const events = [{ time: startOfTime }];
      const result = eventsProcessor.filterEvents(events, defaultConfig);
      result.should.have.lengthOf(events.length);
    });

    it('should return events with codes NOT in SEVERE_MODE_PRODUCTS when severeMode is FALSE', () => {
      const nonSevereCode = 'NON_SEVERE_CODE';
      const events = [{ time: startOfTime, details: { code: nonSevereCode } }];
      const result = eventsProcessor.filterEvents(events, defaultConfig);
      result.should.have.lengthOf(events.length);
    });

    it('should NOT return events with codes NOT in SEVERE_MODE_PRODUCTS when severeMode is TRUE', () => {
      const nonSevereCode = 'NON_SEVERE_CODE';
      const config = {
        age: { value: 0 },
        severeMode: { value: true },
      };
      const events = [{
        time: startOfTime,
        details: { code: nonSevereCode },
       }];
      const result = eventsProcessor.filterEvents(events, config);
      result.should.have.lengthOf(0);
    });

    it('should return events with codes in SEVERE_MODE_PRODUCTS when severeMode is TRUE', () => {
      const severeCode = swareConfig.events.SEVERE_MODE_PRODUCTS[0];
      const config = {
        age: { value: 0 },
        severeMode: { value: true },
      };
      const events = [{
        time: startOfTime,
        details: { code: severeCode },
       }];
      const result = eventsProcessor.filterEvents(events, config);
      result.should.have.lengthOf(events.length);
    });
  });

  describe('processIncomingEvents', () => {
    const defaultEventLimit = 10;

    it('should call formatMessage for each incoming message', () => {
      const incomingEvents = [
        { message: '', product_id: '', ts: '', seqnum: 0 },
        { message: '', product_id: '', ts: '', seqnum: 1 },
        { message: '', product_id: '', ts: '', seqnum: 2 },
      ] as IIEMMessageData[];
      const state = {
        events: [],
        eventsUserConfig: defaultConfig,
      };
      const formatMessageSpy = sinon.spy(iemHelper, 'formatMessage');
      const result = eventsProcessor.processIncomingEvents(incomingEvents, state, defaultEventLimit);
      formatMessageSpy.callCount.should.be.equal(incomingEvents.length);
    });

    describe('truncateOldEvents', () => {
      it('should return all old events concatenated with new events if limit is met', () => {
        const eventLimit = 3;
        const incomingEvents = [
          { message: 'NO TEXT', product_id: '201703202300-KMPX-WGUS81-AFDMPX', ts: '2017-03-20 22:00:00', seqnum: 1 },
        ] as IIEMMessageData[];
        const state = { events: [{}, {}], eventsUserConfig: defaultConfig };
        const result = eventsProcessor.processIncomingEvents(incomingEvents, state, eventLimit);
        result.events.should.have.lengthOf(incomingEvents.length + state.events.length);
      });

      it('should return a number of old events equal to the number the limit has been passed by', () => {
        const eventLimit = 2;
        const incomingEvents = [
          { message: 'NO TEXT', product_id: '201703202300-KMPX-WGUS81-AFDMPX', ts: '2017-03-20 22:00:00', seqnum: 1 },
        ] as IIEMMessageData[];
        const state = { events: [{ old: true }, {old: true }], eventsUserConfig: defaultConfig };
        const result = eventsProcessor.processIncomingEvents(incomingEvents, state, eventLimit);
        result.events.should.have.lengthOf(2) &&
          result.events.filter(x => x.old).should.have.lengthOf(1);
      });

      it('should return no old events, only new events, if limit is passed by number of old events', () => {
        const eventLimit = 1;
        const incomingEvents = [
          { message: 'NO TEXT', product_id: '201703202300-KMPX-WGUS81-AFDMPX', ts: '2017-03-20 22:00:00', seqnum: 1 },
        ] as IIEMMessageData[];
        const state = { events: [{ old: true }, { old: true }], eventsUserConfig: defaultConfig };
        const result = eventsProcessor.processIncomingEvents(incomingEvents, state, eventLimit);
        result.events.should.have.lengthOf(1) &&
          result.events.filter(x => x.old).should.have.lengthOf(0);
      });
    });
  });
});