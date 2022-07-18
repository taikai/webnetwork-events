import { issueRemoveLabel } from "./services/github/index.js";

issueRemoveLabel("I_kwDOHlO0IM5N-aK2", "LA_kwDOHlO0IM7_S3da")
  .then(console.log)
  .catch(console.error);
