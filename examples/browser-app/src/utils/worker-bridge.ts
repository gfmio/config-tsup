export async function initWorker(): Promise<Worker> {
  return new Worker(new URL('../worker.js', import.meta.url), { type: 'module' });
}