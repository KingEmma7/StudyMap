/**
 * StudyMap region + dataset config.
 *
 * Forking StudyMap for a different city or dataset? This is the one file to
 * change. Swap the imports below for your own `data/places/*.json`, and
 * adjust `center` / `defaultZoom` / `cities` to your region, and do the same
 * for the competitions below (or leave `competitions` empty). No other file
 * needs to change; `src/lib/places.ts` and `src/lib/competitions.ts` read from here.
 */
import type { City, Competition, Place } from "@/lib/types";

import airport from "./data/places/airport.json";
import library from "./data/places/library.json";
import otherPlaces from "./data/places/other_places.json";
import satCentre from "./data/places/sat_centre.json";
import foreignLangExamCentre from "./data/places/foreign_lang_exam_centre.json";
import govOffices from "./data/places/gov_offices.json";

import artsDesignCompetitions from "./data/competitions/arts_design.json";
import businessCompetitions from "./data/competitions/business.json";
import codingCompetitions from "./data/competitions/coding.json";
import creativeWritingCompetitions from "./data/competitions/creative_writing.json";
import debateMunCompetitions from "./data/competitions/debate_mun.json";
import essayWritingCompetitions from "./data/competitions/essay_writing.json";
import filmVideoCompetitions from "./data/competitions/film_video.json";
import financeCompetitions from "./data/competitions/finance.json";
import historyCompetitions from "./data/competitions/history.json";
import humanitiesCompetitions from "./data/competitions/humanities.json";
import interdisciplinaryCompetitions from "./data/competitions/interdisciplinary.json";
import mathematicsCompetitions from "./data/competitions/mathematics.json";
import researchCompetitions from "./data/competitions/research.json";
import scholarshipCompetitions from "./data/competitions/scholarship.json";
import stemCompetitions from "./data/competitions/stem.json";

export interface StudyMapConfig {
  /** Initial map center, as [lat, lng]. */
  center: [number, number];
  /** Default zoom level for the initial map view. */
  defaultZoom: number;
  /**
   * Preferred display order for the city filter — a hint, not an exhaustive
   * list. Any city present in the data but missing here still shows, sorted
   * alphabetically after these; you don't need to list every city in your
   * dataset.
   */
  cities: City[];
  /** Every place pin StudyMap renders, merged from the data sources above. */
  places: Place[];
  /**
   * Every competition StudyMap lists, merged from the data sources above
   * (`data/competitions/<category>.json`). Use an empty array if your
   * fork doesn't have a competitions catalog.
   */
  competitions: Competition[];
}

const studyMapConfig: StudyMapConfig = {
  center: [19.08, 72.95],
  defaultZoom: 11,
  cities: ["mumbai", "thane", "navi_mumbai"],
  places: [
    ...(airport as Place[]),
    ...(library as Place[]),
    ...(otherPlaces as Place[]),
    ...(satCentre as Place[]),
    ...(foreignLangExamCentre as Place[]),
    ...(govOffices as Place[]),
  ],
  competitions: [
    ...(artsDesignCompetitions as Competition[]),
    ...(businessCompetitions as Competition[]),
    ...(codingCompetitions as Competition[]),
    ...(creativeWritingCompetitions as Competition[]),
    ...(debateMunCompetitions as Competition[]),
    ...(essayWritingCompetitions as Competition[]),
    ...(filmVideoCompetitions as Competition[]),
    ...(financeCompetitions as Competition[]),
    ...(historyCompetitions as Competition[]),
    ...(humanitiesCompetitions as Competition[]),
    ...(interdisciplinaryCompetitions as Competition[]),
    ...(mathematicsCompetitions as Competition[]),
    ...(researchCompetitions as Competition[]),
    ...(scholarshipCompetitions as Competition[]),
    ...(stemCompetitions as Competition[]),
  ],
};

export default studyMapConfig;
