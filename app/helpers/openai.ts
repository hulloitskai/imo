import type OpenAI from "openai";
import { createContext, useContext } from "react";

export const OpenAIContext = createContext<OpenAI | undefined | null>(null);

export const useOpenAI = (): OpenAI | undefined => {
  const client = useContext(OpenAIContext);
  if (client === null) {
    throw new Error(
      "OpenAI client not found; useOpenAI must be used within an OpenAIProvider",
    );
  }
  return client;
};
