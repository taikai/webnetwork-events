import {
  getBountyAmountUpdatedEvents,
  getBountyCanceledEvents,
  getBountyClosedEvents,
  getBountyCreatedEvents,
} from "./bounty.js";

import { getOraclesChangedEvents } from "./oracles.js";

const events = {
  getBountyCreatedEvents,
  getBountyCanceledEvents,
  getBountyClosedEvents,
  getBountyAmountUpdatedEvents,
  getOraclesChangedEvents,
};

export default events;
