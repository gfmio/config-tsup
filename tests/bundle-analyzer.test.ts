import { describe, expect, it, beforeEach, afterEach, spyOn, mock } from 'bun:test';
import { BundleAnalyzer } from '../src/bundleAnalyzer/analyzer';
import { ConsoleReporter } from '../src/bundleAnalyzer/reporter';
import { formatBytes, getSizeEmoji, sortBySize, getTotalSize, extractFormat } from '../src/bundleAnalyzer/utils';
import { analyzerWithOptions, minimalAnalyzer, strictAnalyzer, ciAnalyzer, devAnalyzer } from '../src/bundleAnalyzer/index';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

describe('Bundle Analyzer Utils', () => {
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(512)).toBe('512.00 B');
      expect(formatBytes(1024)).toBe('1.00 KB');
      expect(formatBytes(1024 * 1024)).toBe('1.00 MB');
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.00 GB');
      expect(formatBytes(1536)).toBe('1.50 KB');
    });
  });

  describe('getSizeEmoji', () => {
    it('should return correct emoji for size', () => {
      const warnThreshold = 512 * 1024; // 512KB

      expect(getSizeEmoji(100 * 1024, warnThreshold)).toBe('✅'); // 100KB - OK
      expect(getSizeEmoji(600 * 1024, warnThreshold)).toBe('⚡'); // 600KB - Warning
      expect(getSizeEmoji(2 * 1024 * 1024, warnThreshold)).toBe('⚠️'); // 2MB - Large
    });
  });

  describe('sortBySize', () => {
    it('should sort bundles by size descending', () => {
      const bundles = [
        { path: 'a.js', size: 100, sizeFormatted: '100 B' },
        { path: 'b.js', size: 500, sizeFormatted: '500 B' },
        { path: 'c.js', size: 200, sizeFormatted: '200 B' },
      ];

      const sorted = sortBySize(bundles);

      expect(sorted[0].size).toBe(500);
      expect(sorted[1].size).toBe(200);
      expect(sorted[2].size).toBe(100);
    });
  });

  describe('getTotalSize', () => {
    it('should calculate total size', () => {
      const bundles = [
        { path: 'a.js', size: 100, sizeFormatted: '100 B' },
        { path: 'b.js', size: 500, sizeFormatted: '500 B' },
        { path: 'c.js', size: 200, sizeFormatted: '200 B' },
      ];

      expect(getTotalSize(bundles)).toBe(800);
    });
  });

  describe('extractFormat', () => {
    it('should extract format from metafile name', () => {
      expect(extractFormat('metafile-cjs.json')).toBe('CJS');
      expect(extractFormat('metafile-esm.json')).toBe('ESM');
      expect(extractFormat('metafile-iife.json')).toBe('IIFE');
      expect(extractFormat('metafile-.json')).toBe('UNKNOWN');
    });
  });
});

describe('ConsoleReporter', () => {
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('should print header', () => {
    const reporter = new ConsoleReporter();
    reporter.printHeader();

    expect(consoleSpy).toHaveBeenCalledWith('\n📊 Bundle Analysis Report');
    expect(consoleSpy).toHaveBeenCalledWith('═'.repeat(60));
  });

  it('should print footer', () => {
    const reporter = new ConsoleReporter();
    reporter.printFooter();

    expect(consoleSpy).toHaveBeenCalledWith('\n✨ Bundle analysis complete!');
  });

  it('should print format stats', () => {
    const reporter = new ConsoleReporter({ detailed: true });
    const stats = {
      format: 'CJS',
      totalSize: 1024 * 100,
      fileCount: 3,
      files: [
        { path: 'dist/index.cjs', size: 50 * 1024, sizeFormatted: '50.00 KB' },
        { path: 'dist/utils.cjs', size: 30 * 1024, sizeFormatted: '30.00 KB' },
      ],
    };

    reporter.printFormatStats(stats);

    expect(consoleSpy).toHaveBeenCalledWith('\n📦 CJS Format:');
    expect(consoleSpy).toHaveBeenCalledWith('   Total size: 100.00 KB');
    expect(consoleSpy).toHaveBeenCalledWith('   Files: 3');
  });

  it('should print warnings for large files', () => {
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    const reporter = new ConsoleReporter({ warnThreshold: 100 * 1024 }); // 100KB
    const files = [
      { path: 'dist/huge.js', size: 300 * 1024, sizeFormatted: '300.00 KB' },
      { path: 'dist/small.js', size: 10 * 1024, sizeFormatted: '10.00 KB' },
    ];

    reporter.printWarnings(files);

    expect(consoleSpy).toHaveBeenCalledWith('\n⚠️  Warning: 1 file(s) exceed size threshold');
    errorSpy.mockRestore();
  });

  it('should print summary', () => {
    const reporter = new ConsoleReporter();
    const formats = [
      {
        format: 'CJS',
        totalSize: 100 * 1024,
        fileCount: 2,
        files: [
          { path: 'a.js', size: 60 * 1024, sizeFormatted: '60 KB' },
          { path: 'b.js', size: 40 * 1024, sizeFormatted: '40 KB' },
        ],
      },
      {
        format: 'ESM',
        totalSize: 90 * 1024,
        fileCount: 2,
        files: [
          { path: 'a.mjs', size: 50 * 1024, sizeFormatted: '50 KB' },
          { path: 'b.mjs', size: 40 * 1024, sizeFormatted: '40 KB' },
        ],
      },
    ];

    reporter.printSummary(formats);

    expect(consoleSpy).toHaveBeenCalledWith('📈 Summary:');
    expect(consoleSpy).toHaveBeenCalledWith('   Total output size: 190.00 KB');
    expect(consoleSpy).toHaveBeenCalledWith('   Total files: 4');
    expect(consoleSpy).toHaveBeenCalledWith('   Formats: CJS, ESM');
  });

  it('should print visualization status', () => {
    const reporter = new ConsoleReporter();
    const files = ['bundle-analysis-cjs.html', 'bundle-analysis-esm.html'];

    reporter.printVisualizationStatus(files);

    expect(consoleSpy).toHaveBeenCalledWith('\n🎨 Visualizations generated:');
    expect(consoleSpy).toHaveBeenCalledWith('   ✅ bundle-analysis-cjs.html');
    expect(consoleSpy).toHaveBeenCalledWith('   ✅ bundle-analysis-esm.html');
  });

  it('should print error messages', () => {
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
    const reporter = new ConsoleReporter({ detailed: true });
    const error = new Error('Test error');
    error.stack = 'Test stack trace';

    reporter.printError('Analysis failed', error);

    expect(errorSpy).toHaveBeenCalledWith('\n❌ Error: Analysis failed');
    expect(errorSpy).toHaveBeenCalledWith('   Details:', 'Test error');
    expect(errorSpy).toHaveBeenCalledWith('   Stack:', 'Test stack trace');

    errorSpy.mockRestore();
  });

  it('should print info messages', () => {
    const reporter = new ConsoleReporter();
    reporter.printInfo('Test info message');

    expect(consoleSpy).toHaveBeenCalledWith('ℹ️  Test info message');
  });
});

describe('BundleAnalyzer', () => {
  const testDir = join(process.cwd(), 'test-dist');

  beforeEach(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should analyze metafiles', async () => {
    // Create test metafile
    const metafile = {
      inputs: {},
      outputs: {
        'test-dist/index.cjs': {
          bytes: 1024 * 50,
        },
        'test-dist/utils.cjs': {
          bytes: 1024 * 30,
        },
      },
    };

    await writeFile(
      join(testDir, 'metafile-cjs.json'),
      JSON.stringify(metafile)
    );

    // Spy on console methods
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = spyOn(console, 'error').mockImplementation(() => {});

    const analyzer = new BundleAnalyzer(
      {
        detailed: true,
        visualizer: 'off',
        warnThreshold: 100 * 1024,
      },
      { outDir: testDir }
    );

    await analyzer.analyze();

    // Should have printed analysis
    expect(logSpy).toHaveBeenCalledWith('\n📊 Bundle Analysis Report');
    expect(logSpy).toHaveBeenCalledWith('\n📦 CJS Format:');
    expect(logSpy).toHaveBeenCalledWith('   Total size: 80.00 KB');
    expect(logSpy).toHaveBeenCalledWith('   Files: 2');

    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should handle missing metafiles', async () => {
    const logSpy = spyOn(console, 'log').mockImplementation(() => {});

    const analyzer = new BundleAnalyzer(
      { visualizer: 'off' },
      { outDir: testDir }
    );

    await analyzer.analyze();

    expect(logSpy).toHaveBeenCalledWith('ℹ️  No metafiles found for bundle analysis');

    logSpy.mockRestore();
  });

  it('should fail on large bundles when configured', async () => {
    const metafile = {
      inputs: {},
      outputs: {
        'test-dist/huge.js': {
          bytes: 1024 * 1024 * 2, // 2MB
        },
      },
    };

    await writeFile(
      join(testDir, 'metafile-esm.json'),
      JSON.stringify(metafile)
    );

    const logSpy = spyOn(console, 'log').mockImplementation(() => {});

    const analyzer = new BundleAnalyzer(
      {
        failOnLarge: true,
        warnThreshold: 512 * 1024, // 512KB
        visualizer: 'off',
      },
      { outDir: testDir }
    );

    await expect(analyzer.analyze()).rejects.toThrow('Build failed: 1 file(s) exceed size limit');

    logSpy.mockRestore();
  });
});

describe('Analyzer Configurations', () => {
  it('should create minimal analyzer config', () => {
    const config = minimalAnalyzer;

    expect(config.metafile).toBe(true);
    expect(config.onSuccess).toBeDefined();
  });

  it('should create strict analyzer config', () => {
    const config = strictAnalyzer;

    expect(config.metafile).toBe(true);
    expect(config.onSuccess).toBeDefined();
  });

  it('should create CI analyzer config', () => {
    const config = ciAnalyzer;

    expect(config.metafile).toBe(true);
    expect(config.onSuccess).toBeDefined();
  });

  it('should create dev analyzer config', () => {
    const config = devAnalyzer;

    expect(config.metafile).toBe(true);
    expect(config.onSuccess).toBeDefined();
  });

  it('should create custom analyzer config', () => {
    const config = analyzerWithOptions({
      warnThreshold: 256 * 1024,
      failOnLarge: true,
      visualizer: 'required',
      template: 'sunburst',
    });

    expect(config.metafile).toBe(true);
    expect(config.onSuccess).toBeDefined();
  });
});