import { useSyncExternalStore } from "react";
import { portfolioRepository } from "../repositories/portfolioRepository";

export function usePortfolioData() {
  return useSyncExternalStore(
    portfolioRepository.subscribe,
    portfolioRepository.getSnapshot,
    portfolioRepository.getSnapshot,
  );
}
