#!/usr/bin/env node


import {translate} from './main';
import {Command} from 'commander';


const program = new Command();
program.version('0.0.1')
    .name('fy')
    .usage('<english>')
    .arguments('<english>')
    .action((english) => {
        translate(english)
    });
program.parse(process.argv);