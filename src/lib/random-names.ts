import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
  starWars,
} from "unique-names-generator";

const configStarWars: Config = {
  dictionaries: [starWars],
  separator: " ",
  length: 1,
};
const configAdjectives: Config = {
  dictionaries: [adjectives],
  separator: " ",
  length: 1,
};
const configColors: Config = {
  dictionaries: [colors],
  separator: " ",
  length: 1,
};
const configAnimals: Config = {
  dictionaries: [animals],
  separator: " ",
  length: 1,
};

export const randomName = () => uniqueNamesGenerator(configStarWars);
