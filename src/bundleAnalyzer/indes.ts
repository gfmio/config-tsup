export const onSuccess = async () => {
  try {
    const { readdir, readFile } = await import('fs/promises');
    const { join } = await import('path');
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    const distDir = join(process.cwd(), 'dist');
    const files = await readdir(distDir);
    const metafiles = files.filter(f => f.startsWith('metafile-') && f.endsWith('.json'));

    if (metafiles.length === 0) {
      console.log('⚠️  No metafiles found for bundle analysis');
      return;
    }

    console.log('\n📊 Bundle Analysis Report');
    console.log('═'.repeat(60));

    // Process each metafile for basic stats
    for (const metafileName of metafiles) {
      const metafilePath = join(distDir, metafileName);
      const format = metafileName.replace('metafile-', '').replace('.json', '').toUpperCase();

      // Read metafile to get basic stats
      const metafileContent = await readFile(metafilePath, 'utf-8');
      const metafile = JSON.parse(metafileContent);
      const outputs = Object.entries(metafile.outputs || {});

      // Calculate total size for this format
      const totalSize = outputs.reduce((sum, [, info]: [string, any]) => sum + info.bytes, 0);
      const totalSizeKB = (totalSize / 1024).toFixed(2);
      const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

      console.log(`\n📦 ${format} Format:`);
      console.log(`   Total size: ${totalSize < 1024 * 1024 ? totalSizeKB + ' KB' : totalSizeMB + ' MB'}`);
      console.log(`   Files: ${outputs.length}`);

      // List individual files
      outputs.forEach(([path, info]: [string, any]) => {
        const relativePath = path.replace(process.cwd() + '/', '');
        const size = info.bytes;
        const sizeStr = size < 1024
          ? `${size} B`
          : size < 1024 * 1024
            ? `${(size / 1024).toFixed(2)} KB`
            : `${(size / 1024 / 1024).toFixed(2)} MB`;

        const emoji = size > 1024 * 1024 ? '⚠️ '
          : size > 512 * 1024 ? '⚡'
            : '✅';

        console.log(`   ${emoji} ${relativePath.padEnd(35)} ${sizeStr.padStart(10)}`);
      });
    }

    console.log('\n' + '═'.repeat(60));

    // Generate visualizations using esbuild-visualizer if available
    const visualizerMode = process.env['TSUP_VISUALIZER'] || 'auto';

    if (visualizerMode !== 'off') {
      try {
        console.log('\n🎨 Generating interactive bundle visualizations...');

        for (const metafileName of metafiles) {
          const metafilePath = join(distDir, metafileName);
          const format = metafileName.replace('metafile-', '').replace('.json', '');
          const outputName = `bundle-analysis-${format}.html`;
          const outputPath = join(distDir, outputName);

          // Generate visualization using esbuild-visualizer
          // Using --filename instead of --output (correct parameter)
          await execAsync(
            `esbuild-visualizer --metadata "${metafilePath}" --filename "${outputPath}" --template treemap`,
            { cwd: process.cwd() }
          );

          console.log(`   ✅ Created: dist/${outputName}`);
        }

        console.log('\n💡 Tip: Open the HTML files in your browser to explore the interactive bundle visualization');
      } catch (error: any) {
        if (visualizerMode === 'required') {
          console.error('\n❌ Failed to generate visualizations:', error);
          throw error;
        } else if (process.env['DEBUG']) {
          console.error('Visualization generation failed:', error);
        }
      }
    }

    console.log('\n✨ Bundle analysis complete!\n');

  } catch (error) {
    // Fail silently unless in debug mode
    if (process.env['DEBUG']) {
      console.error('Bundle analysis failed:', error);
    }
  }
};
