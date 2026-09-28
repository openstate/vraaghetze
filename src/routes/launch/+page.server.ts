import * as politicians from '$lib/server/politicians';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  let politiciansWithPhotos = await politicians.politiciansWithPhotos();
  const slugs = SLUGS();
  politiciansWithPhotos = Object.fromEntries(Object.entries(politiciansWithPhotos).filter(([key, value]) => slugs.includes(key)));

  return {
    politiciansWithPhotos, slugs
  };
};

const SLUGS = () => {
  return [
    "jan-struijs",
    "henk-vermeer",
    "henri-bontenbal",
    "elles-van-ark",
    "harmen-krul",
    "jeltje-straatman",
    "tijs-van-den-brink",
    "mirjam-bikker",
    "joost-sneller",
    "jan-paternotte",
    "marieke-vellinga-beemsterboer",
    "wieke-paulusma",
    "henk-jan-oosterhuis",
    "dion-huidekooper",
    "mahjoub-mathlouti",
    "ulas-kose",
    "anouschka-biekman",
    "fatimazhra-belhirch",
    "stephan-van-baarle",
    "gidi-markuszower",
    "ingrid-coenradie",
    "joost-eerdmans",
    "fatihya-abdi",
    "lisa-westerveld",
    "mohammed-mohandis",
    "kati-piri",
    "jesse-klaver",
    "lisa-vliegenthart",
    "esther-ouwehand",
    "ines-kostic",
    "geert-wilders",
    "dion-graus",
    "martin-bosma",
    "chris-stoffer",
    "jimmy-dijk",
    "laurens-dassen",
    "ruben-brekelmans",
    "bart-bikkers",
    "thom-van-campen",
    "daan-de-kort",
    "bjorn-schutz",
    "wendy-van-eijk"
  ];
}