import { textbook } from "tutor-kit";
import onSaleControlPlane from "./chapters/on-sale-control-plane.chapter.js";
import inventoryLedgerNotCache from "./chapters/inventory-ledger-not-cache.chapter.js";
import waitingRoomAdmissionGate from "./chapters/waiting-room-admission-gate.chapter.js";
import checkoutAsSaga from "./chapters/checkout-as-saga.chapter.js";
import readModelsForAvailability from "./chapters/read-models-for-availability.chapter.js";
import failureDrillsOperationalSignals from "./chapters/failure-drills-operational-signals.chapter.js";
import cumulativeDesignReview from "./chapters/cumulative-design-review.chapter.js";

export default textbook({
  id: "concert-ticketing-onsale",
  title: "Designing a Major Concert Ticketing On-Sale",
  description: "A practical system-design course on absorbing on-sale traffic spikes, protecting scarce ticket inventory, running checkout safely, and operating launch day.",
  chapters: [
    onSaleControlPlane,
    inventoryLedgerNotCache,
    waitingRoomAdmissionGate,
    checkoutAsSaga,
    readModelsForAvailability,
    failureDrillsOperationalSignals,
    cumulativeDesignReview
  ]
});
