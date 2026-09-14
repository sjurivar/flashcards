export type { LearningOutcomeRecord } from './domain/outcome';
export {
  ensureOutcome,
  findOutcomeByText,
  getOutcome,
  listOutcomes,
  putOutcome,
  replaceAllOutcomes,
} from './storage/outcomeStore';
