import { tsupBuilder } from '@gfmio/config-tsup/builder';

// Browser application with code splitting and bundle analysis
export default tsupBuilder()
  .entry({
    app: 'src/app.ts',
    worker: 'src/worker.ts'
  })
  .asBrowserBundle()
  .withSplitting()
  .env('production')
  .withBundleAnalysis({
    warnThreshold: 200 * 1024  // Warn at 200KB
  })
  .build();