import {
  getBountyAmountUpdatedEvents,
  getBountyCanceledEvents,
  getBountyClosedEvents,
  getBountyCreatedEvents,
} from "./bounty.js";

import { getOraclesChangedEvents } from "./oracles.js";

import {
  getBountyPullRequestCanceledEvents,
  getBountyPullRequestCreatedEvents,
  getBountyPullRequestReadyForReviewEvents,
} from "./pullrequest.js";

const events = {
  getBountyCreatedEvents,
  getBountyCanceledEvents,
  getBountyClosedEvents,
  getBountyAmountUpdatedEvents,
  getOraclesChangedEvents,
  getBountyPullRequestCreatedEvents,
  getBountyPullRequestReadyForReviewEvents,
  getBountyPullRequestCanceledEvents,
};

export default events;
