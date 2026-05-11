import { scenarioPO1 } from "./data/po1";
import { scenarioCU1 } from "./data/cu1";
import { scenarioCU2 } from "./data/cu2";
import { scenarioCU3 } from "./data/cu3";
import { scenarioIS1 } from "./data/is1";
import { scenarioFS2 } from "./data/fs2";
import { scenarioFS3 } from "./data/fs3";
import { scenarioFS4 } from "./data/fs4";
import { scenarioFU1 } from "./data/fu1";
import { scenarioFU2 } from "./data/fu2";
import { scenarioZT1 } from "./data/zt1";
import { scenarioZT5 } from "./data/zt5";
import { scenarioZP1 } from "./data/zp1";
import { scenarioZP4 } from "./data/zp4";
import type { Scenario, ScenarioId } from "./types";

export type { Scenario, ScenarioId };
export * from "./types";
export * from "./groups";

export const scenarioOrder: ScenarioId[] = [
  "CU-1", "CU-2", "CU-3",
  "IS-1", "FS-2", "FS-3",
  "FU-1", "FU-2",
  "ZT-1", "ZT-5",
  "ZP-1", "ZP-4",
];

export const scenarios: Record<ScenarioId, Scenario> = {
  "PO-1": scenarioPO1,
  "CU-1": scenarioCU1,
  "CU-2": scenarioCU2,
  "CU-3": scenarioCU3,
  "IS-1": scenarioIS1,
  "FS-2": scenarioFS2,
  "FS-3": scenarioFS3,
  "FS-4": scenarioFS4,
  "FU-1": scenarioFU1,
  "FU-2": scenarioFU2,
  "ZT-1": scenarioZT1,
  "ZT-5": scenarioZT5,
  "ZP-1": scenarioZP1,
  "ZP-4": scenarioZP4,
};
