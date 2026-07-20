import { defineComponent } from "tutor-kit/client";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function statusClass(value: number, limit: number): string {
  if (value <= limit * 0.75) return "ok";
  if (value <= limit) return "warn";
  return "danger";
}

export default defineComponent(async ({ root }) => {
  root.innerHTML = `
    <style>
      .pressure-lab {
        border: 1px solid color-mix(in srgb, currentColor 18%, transparent);
        border-radius: 8px;
        padding: 16px;
        display: grid;
        gap: 16px;
        background: color-mix(in srgb, Canvas 94%, CanvasText 6%);
      }

      .pressure-lab__controls {
        display: grid;
        gap: 14px;
      }

      .pressure-lab__control {
        display: grid;
        gap: 6px;
      }

      .pressure-lab__control label {
        font-weight: 650;
      }

      .pressure-lab__control input {
        width: 100%;
      }

      .pressure-lab__hint {
        font-size: 0.92rem;
        opacity: 0.78;
      }

      .pressure-lab__metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
        gap: 10px;
      }

      .pressure-lab__metric {
        border: 1px solid color-mix(in srgb, currentColor 14%, transparent);
        border-radius: 8px;
        padding: 12px;
        background: Canvas;
      }

      .pressure-lab__label {
        font-size: 0.82rem;
        opacity: 0.72;
      }

      .pressure-lab__value {
        font-size: 1.35rem;
        font-weight: 750;
        line-height: 1.2;
        margin-top: 4px;
      }

      .pressure-lab__metric.ok .pressure-lab__value {
        color: #177245;
      }

      .pressure-lab__metric.warn .pressure-lab__value {
        color: #8a5a00;
      }

      .pressure-lab__metric.danger .pressure-lab__value {
        color: #b42318;
      }

      .pressure-lab__bars {
        display: grid;
        gap: 10px;
      }

      .pressure-lab__bar-row {
        display: grid;
        gap: 4px;
      }

      .pressure-lab__bar-top {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        font-size: 0.9rem;
      }

      .pressure-lab__track {
        height: 12px;
        overflow: hidden;
        border-radius: 999px;
        background: color-mix(in srgb, currentColor 10%, transparent);
      }

      .pressure-lab__fill {
        height: 100%;
        width: 0%;
        border-radius: inherit;
        background: #177245;
        transition: width 120ms ease, background-color 120ms ease;
      }

      .pressure-lab__fill.warn {
        background: #b7791f;
      }

      .pressure-lab__fill.danger {
        background: #c0362c;
      }

      .pressure-lab__readout {
        border-left: 4px solid color-mix(in srgb, currentColor 28%, transparent);
        padding-left: 12px;
      }
    </style>
    <div class="pressure-lab">
      <div class="pressure-lab__controls">
        <div class="pressure-lab__control">
          <label for="burst">Burst arrivals per second: <span data-out="burst"></span></label>
          <input id="burst" data-input="burst" type="range" min="1000" max="80000" step="1000" value="50000" />
          <div class="pressure-lab__hint">People trying to enter the sale at the same moment.</div>
        </div>
        <div class="pressure-lab__control">
          <label for="admit">Admitted buyers per second: <span data-out="admit"></span></label>
          <input id="admit" data-input="admit" type="range" min="50" max="1200" step="25" value="250" />
          <div class="pressure-lab__hint">The gate setting for buyers allowed into seat selection.</div>
        </div>
        <div class="pressure-lab__control">
          <label for="checkout">Average checkout time in minutes: <span data-out="checkout"></span></label>
          <input id="checkout" data-input="checkout" type="range" min="2" max="12" step="1" value="6" />
          <div class="pressure-lab__hint">Longer checkout means more active holds at the same admission rate.</div>
        </div>
      </div>

      <div class="pressure-lab__metrics">
        <div class="pressure-lab__metric" data-metric="queue">
          <div class="pressure-lab__label">Queue growth per minute</div>
          <div class="pressure-lab__value" data-out="queueGrowth"></div>
        </div>
        <div class="pressure-lab__metric" data-metric="writes">
          <div class="pressure-lab__label">Hold attempts per minute</div>
          <div class="pressure-lab__value" data-out="holdWrites"></div>
        </div>
        <div class="pressure-lab__metric" data-metric="holds">
          <div class="pressure-lab__label">Seats under active holds</div>
          <div class="pressure-lab__value" data-out="activeSeats"></div>
        </div>
      </div>

      <div class="pressure-lab__bars">
        <div class="pressure-lab__bar-row">
          <div class="pressure-lab__bar-top">
            <span>Inventory write budget</span>
            <span data-out="writeBudgetLabel"></span>
          </div>
          <div class="pressure-lab__track"><div class="pressure-lab__fill" data-fill="writes"></div></div>
        </div>
        <div class="pressure-lab__bar-row">
          <div class="pressure-lab__bar-top">
            <span>Active hold pressure</span>
            <span data-out="holdBudgetLabel"></span>
          </div>
          <div class="pressure-lab__track"><div class="pressure-lab__fill" data-fill="holds"></div></div>
        </div>
      </div>

      <div class="pressure-lab__readout" data-out="readout"></div>
    </div>
  `;

  const inputs = {
    burst: root.querySelector<HTMLInputElement>("[data-input='burst']")!,
    admit: root.querySelector<HTMLInputElement>("[data-input='admit']")!,
    checkout: root.querySelector<HTMLInputElement>("[data-input='checkout']")!
  };

  const outputs = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>("[data-out]").forEach((element) => {
    outputs.set(element.dataset.out ?? "", element);
  });

  const metricElements = {
    queue: root.querySelector<HTMLElement>("[data-metric='queue']")!,
    writes: root.querySelector<HTMLElement>("[data-metric='writes']")!,
    holds: root.querySelector<HTMLElement>("[data-metric='holds']")!
  };

  const fillElements = {
    writes: root.querySelector<HTMLElement>("[data-fill='writes']")!,
    holds: root.querySelector<HTMLElement>("[data-fill='holds']")!
  };

  const setText = (key: string, value: string) => {
    const element = outputs.get(key);
    if (element) element.textContent = value;
  };

  const setMetricClass = (element: HTMLElement, level: string) => {
    element.classList.remove("ok", "warn", "danger");
    element.classList.add(level);
  };

  const render = () => {
    const burst = Number(inputs.burst.value);
    const admit = Number(inputs.admit.value);
    const checkoutMinutes = Number(inputs.checkout.value);
    const averageSeatsPerBuyer = 2;
    const writeBudgetPerMinute = 18000;
    const activeSeatBudget = 70000;

    const queueGrowth = Math.max(0, burst - admit) * 60;
    const holdWrites = admit * 60;
    const activeBuyers = admit * checkoutMinutes * 60;
    const activeSeats = activeBuyers * averageSeatsPerBuyer;
    const writeLevel = statusClass(holdWrites, writeBudgetPerMinute);
    const holdLevel = statusClass(activeSeats, activeSeatBudget);
    const writePercent = Math.min(100, (holdWrites / writeBudgetPerMinute) * 100);
    const holdPercent = Math.min(100, (activeSeats / activeSeatBudget) * 100);

    setText("burst", `${formatNumber(burst)}/sec`);
    setText("admit", `${formatNumber(admit)}/sec`);
    setText("checkout", `${checkoutMinutes}`);
    setText("queueGrowth", formatNumber(queueGrowth));
    setText("holdWrites", formatNumber(holdWrites));
    setText("activeSeats", formatNumber(activeSeats));
    setText("writeBudgetLabel", `${formatNumber(holdWrites)} of ${formatNumber(writeBudgetPerMinute)}/min`);
    setText("holdBudgetLabel", `${formatNumber(activeSeats)} of ${formatNumber(activeSeatBudget)} seats`);

    fillElements.writes.style.width = `${writePercent}%`;
    fillElements.holds.style.width = `${holdPercent}%`;
    fillElements.writes.className = `pressure-lab__fill ${writeLevel}`;
    fillElements.holds.className = `pressure-lab__fill ${holdLevel}`;
    setMetricClass(metricElements.queue, queueGrowth > 0 ? "warn" : "ok");
    setMetricClass(metricElements.writes, writeLevel);
    setMetricClass(metricElements.holds, holdLevel);

    const readout =
      writeLevel === "danger"
        ? "This gate is admitting more hold traffic than the inventory budget. Expect timeouts, retries, and seat-claim conflicts to amplify."
        : holdLevel === "danger"
          ? "The write rate is plausible, but too many seats are tied up in checkout. Shorten holds, lower admission, or improve checkout completion."
          : queueGrowth > 0
            ? "The queue is absorbing the burst while the inventory path stays bounded."
            : "The arrival rate is already below the gate. The queue is not doing much useful work in this setting.";
    setText("readout", readout);
  };

  const listeners = Object.values(inputs).map((input) => {
    input.addEventListener("input", render);
    return input;
  });

  render();

  return async () => {
    listeners.forEach((input) => input.removeEventListener("input", render));
  };
});
