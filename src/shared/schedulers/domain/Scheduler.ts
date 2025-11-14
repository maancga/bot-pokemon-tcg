export interface Scheduler {
  start(): void;
  runInitialSync(): Promise<void>;
}
