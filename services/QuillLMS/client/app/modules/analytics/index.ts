import { Event, Events, validateEvent } from './events';


class SegmentAnalytics {
  analytics: Object;

  constructor() {
    console.log(window);
    console.log(window.analytics);
    try {
      this.analytics = (<any>window).analytics;
    } catch(e) {
      console.log(e);
      this.reportError(e);
      this.analytics = null;
    }
    console.log('done with analytics constructor');
  }

  attachAnalytis() {
    this.analytics = window.analytics;
  }

  track(event: Event, properties: object): void {
    try {
      // Make sure that the event reference is one that's defined
      if (!event) {
        throw new Error('The event referenced does not exist.');
      }

      // Validate that required properties are present
      this.validateEvent(event, properties);

      // Check to make sure that we have access to the analytics global
      if (!this.analytics) {
        throw new Error(`Error sending event '${event.name}'.  SegmentAnalytics was instantiated before an instance of window.analytics could be found to connect to.`);
      }
    } catch(e) {
      this.reportError(e);
      return
    }

    const eventProperties = Object.assign(this.formatCustomProperties(properties), this.getDefaultProperties());

    this.analytics.track(event.name, eventProperties);
  }

  validateEvent (event: Event, properties?: object): void {
    if (properties === undefined) {
      properties = {};
    }
    if (event.requiredProperties) {
      let passedEventProperties = Object.keys(properties);
      event.requiredProperties.forEach((p) => {
        if (passedEventProperties.indexOf(p) == -1) {
          throw new Error(`Can not track event "${event.name}" without required property "${p}".`);
        }
      });
    }
  }

  formatCustomProperties(properties: object): object {
    if (typeof properties != 'object') {
      properties = {};
    }
    return Object.keys(properties).reduce((accumulator, key) => {
      let customKeyName = `custom_${key}`;
      accumulator[customKeyName] = properties[key];
      return accumulator;
    }, {});
  }

  getDefaultProperties(): object {
    return {
      path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
      referrer: document.referrer,
    };
  }

  reportError(e: Error): void {
    // placeholder for actual error reporting
    console.error(e);
  }
}

const segmentInstance = new SegmentAnalytics();

export default segmentInstance;
