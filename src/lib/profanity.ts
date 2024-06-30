import BadWordsNext from "bad-words-next";
import en from "../constants/profanity-dict-en.json";
import hi from "../constants/profanity-dict-hi.json";

const badwords = new BadWordsNext();
badwords.add(en);
// badwords.add(hi);

export const isProfane = (text: string): boolean => {
  return badwords.check(text);
};

export const filterProfane = (text: string): string => {
  return badwords.filter(text);
};
