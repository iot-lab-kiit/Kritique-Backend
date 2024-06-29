import BadWordsNext from "bad-words-next";
import en from "bad-words-next/data/en.json";
import hi from "../constants/profanityDict.json";

const badwords = new BadWordsNext();
badwords.add(en);
badwords.add(hi);

export const isProfane = (text: string): boolean => {
  return badwords.check(text);
};
