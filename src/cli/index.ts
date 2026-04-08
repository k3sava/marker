#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './init.js';
import { devCommand } from './dev.js';
import { addCommand } from './add.js';
import { shareCommand } from './share.js';
import { importCommand } from './import.js';
import { reviewCommand } from './review.js';
import { statusCommand } from './status.js';

const program = new Command();

program
  .name('marker')
  .description('Review-native slide tool')
  .version('0.1.0');

program
  .command('init [name]')
  .description('Create a new deck')
  .option('-a, --author <author>', 'Author name', '')
  .action(initCommand);

program
  .command('dev')
  .description('Start local dev server')
  .option('-p, --port <port>', 'Port number')
  .option('--no-open', 'Do not open browser')
  .action(devCommand);

program
  .command('add [type]')
  .description('Add a slide (title, section, bullets, comparison, metric, table)')
  .option('--after <slideId>', 'Insert after this slide')
  .action(addCommand);

program
  .command('share')
  .description('Build and deploy deck for review')
  .option('--local', 'Build to ./dist only, do not deploy')
  .action(shareCommand);

program
  .command('import [source]')
  .description('Import reviewer comments from file or stdin')
  .action(importCommand);

program
  .command('review')
  .description('AI processes open comments into edits')
  .option('--apply', 'Apply all edits without confirmation')
  .option('--dry-run', 'Show proposals, change nothing')
  .action(reviewCommand);

program
  .command('status')
  .description('Show deck summary')
  .action(statusCommand);

program.parse();
