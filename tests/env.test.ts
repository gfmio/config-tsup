import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import process from 'node:process';

import { getBuildMode, isCI, isDevelopment, isProduction, isWatchMode } from '../src/utils/env.ts';

describe('Environment Detection', () => {
  const originalEnv = process.env;
  const originalArgv = process.argv;

  beforeEach(() => {
    // Reset environment before each test
    process.env = {
      ...originalEnv,
    };
    process.argv = [
      ...originalArgv,
    ];
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    process.argv = originalArgv;
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is development', () => {
      process.env['NODE_ENV'] = 'development';
      expect(isDevelopment()).toBe(true);
    });

    it('should return true when NODE_ENV is dev', () => {
      process.env['NODE_ENV'] = 'dev';
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when NODE_ENV is production', () => {
      process.env['NODE_ENV'] = 'production';
      expect(isDevelopment()).toBe(false);
    });

    it('should return false when NODE_ENV is not set', () => {
      process.env['NODE_ENV'] = undefined;
      expect(isDevelopment()).toBe(false);
    });

    it('should return false for other NODE_ENV values', () => {
      process.env['NODE_ENV'] = 'test';
      expect(isDevelopment()).toBe(false);
      process.env['NODE_ENV'] = 'staging';
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      process.env['NODE_ENV'] = 'production';
      expect(isProduction()).toBe(true);
    });

    it('should return true when NODE_ENV is prod', () => {
      process.env['NODE_ENV'] = 'prod';
      expect(isProduction()).toBe(true);
    });

    it('should return false when NODE_ENV is development', () => {
      process.env['NODE_ENV'] = 'development';
      expect(isProduction()).toBe(false);
    });

    it('should return true when NODE_ENV is not set (defaults to production)', () => {
      process.env['NODE_ENV'] = undefined;
      expect(isProduction()).toBe(true);
    });

    it('should return true for other NODE_ENV values (defaults to production)', () => {
      process.env['NODE_ENV'] = 'test';
      expect(isProduction()).toBe(true);
      process.env['NODE_ENV'] = 'staging';
      expect(isProduction()).toBe(true);
    });
  });

  describe('getBuildMode', () => {
    it('should return development when NODE_ENV is development', () => {
      process.env['NODE_ENV'] = 'development';
      expect(getBuildMode()).toBe('development');
    });

    it('should return development when NODE_ENV is dev', () => {
      process.env['NODE_ENV'] = 'dev';
      expect(getBuildMode()).toBe('development');
    });

    it('should return production when NODE_ENV is production', () => {
      process.env['NODE_ENV'] = 'production';
      expect(getBuildMode()).toBe('production');
    });

    it('should return production when NODE_ENV is prod', () => {
      process.env['NODE_ENV'] = 'prod';
      expect(getBuildMode()).toBe('production');
    });

    it('should return production for other NODE_ENV values', () => {
      process.env['NODE_ENV'] = 'test';
      expect(getBuildMode()).toBe('production');
      process.env['NODE_ENV'] = 'staging';
      expect(getBuildMode()).toBe('production');
    });

    it('should return production when NODE_ENV is not set', () => {
      process.env['NODE_ENV'] = undefined;
      expect(getBuildMode()).toBe('production');
    });
  });

  describe('isCI', () => {
    it('should return true when CI environment variable is set to true', () => {
      process.env['CI'] = 'true';
      expect(isCI()).toBe(true);
    });

    it('should return true when CI environment variable is set to 1', () => {
      process.env['CI'] = '1';
      expect(isCI()).toBe(true);
    });

    it("should return true when CI environment variable is 'false' (string is truthy)", () => {
      process.env['CI'] = 'false';
      expect(isCI()).toBe(true); // Any non-empty string is truthy
    });

    it("should return true when CI environment variable is '0' (string is truthy)", () => {
      process.env['CI'] = '0';
      expect(isCI()).toBe(true); // Any non-empty string is truthy
    });

    it('should return false when CI environment variable is not set', () => {
      process.env['CI'] = undefined;
      expect(isCI()).toBe(false);
    });

    it('should return true for various CI provider environment variables', () => {
      // GitHub Actions
      process.env['GITHUB_ACTIONS'] = 'true';
      expect(isCI()).toBe(true);
      process.env['GITHUB_ACTIONS'] = undefined;

      // GitLab CI
      process.env['GITLAB_CI'] = 'true';
      expect(isCI()).toBe(true);
      process.env['GITLAB_CI'] = undefined;

      // Travis CI
      process.env['TRAVIS'] = 'true';
      expect(isCI()).toBe(true);
      process.env['TRAVIS'] = undefined;

      // CircleCI
      process.env['CIRCLECI'] = 'true';
      expect(isCI()).toBe(true);
      process.env['CIRCLECI'] = undefined;

      // Jenkins
      process.env['JENKINS_URL'] = 'http://jenkins.example.com';
      expect(isCI()).toBe(true);
      process.env['JENKINS_URL'] = undefined;

      // Note: Bitbucket Pipelines not currently supported in isCI()
    });
  });

  describe('isWatchMode', () => {
    it('should return true when --watch flag is present', () => {
      process.argv = [
        'node',
        'script.js',
        '--watch',
      ];
      expect(isWatchMode()).toBe(true);
    });

    it('should return true when -w flag is present', () => {
      process.argv = [
        'node',
        'script.js',
        '-w',
      ];
      expect(isWatchMode()).toBe(true);
    });

    it('should return true when WATCH environment variable is true', () => {
      process.env['WATCH'] = 'true';
      expect(isWatchMode()).toBe(true);
    });

    it('should return true when WATCH environment variable is 1', () => {
      process.env['WATCH'] = '1';
      expect(isWatchMode()).toBe(true);
    });

    it('should return false when no watch indicators are present', () => {
      process.argv = [
        'node',
        'script.js',
      ];
      process.env['WATCH'] = undefined;
      expect(isWatchMode()).toBe(false);
    });

    it("should return true when WATCH is 'false' (string is truthy)", () => {
      process.env['WATCH'] = 'false';
      process.argv = [
        'node',
        'script.js',
      ];
      expect(isWatchMode()).toBe(true); // Any non-empty string is truthy
    });

    it("should return true when WATCH is '0' (string is truthy)", () => {
      process.env['WATCH'] = '0';
      process.argv = [
        'node',
        'script.js',
      ];
      expect(isWatchMode()).toBe(true); // Any non-empty string is truthy
    });

    it('should return true when both --watch and WATCH are present', () => {
      process.argv = [
        'node',
        'script.js',
        '--watch',
      ];
      process.env['WATCH'] = 'true';
      expect(isWatchMode()).toBe(true);
    });

    it('should handle watch flag in different positions', () => {
      process.argv = [
        'node',
        '--watch',
        'script.js',
      ];
      expect(isWatchMode()).toBe(true);

      process.argv = [
        'node',
        'script.js',
        'arg1',
        '--watch',
        'arg2',
      ];
      expect(isWatchMode()).toBe(true);
    });
  });
});
