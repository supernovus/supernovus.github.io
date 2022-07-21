#!/usr/bin/env node
/// A script to update the documentation in this static website.

// Sanity check.
if (typeof require === 'undefined')
{
  throw new Error("Cannot use this outside of Node");
}

const DEBUG = false;

const fs = require('fs');
const path = require('path');
const Rsync = require('rsync');

// A configuration file in JS format so it can have functions.
// Only using `docDir(proj)` which returns the local source folder for docs.
const config = require('../update-config.js');

// A cache of update information, including last version of docs copied.
const cache = require('./src/cache.js').get('../update-cache.json');

// Our projects configuration file.
const projects = require('./src/projects.json');
const docdir = projects.docurl;

// Properties that must be in a project definition for it to be valid.
const NEEDED = ['name','lang','ver'];

// Number of projects to process.
const count = projects.projects.length;

let processed = 0;
let updated = 0;

function valid(proj)
{
  for (const need of NEEDED)
  {
    if (!(need in proj))
    { 
      return false;
    }
  }
  return true;
}

function done()
{
  if (arguments.length > 0)
  { // Messages were sent.
    console.log(...arguments);
  }

  if (++processed === count)
  { // We processed all projects.
    if (updated > 0)
    { // At least one project was updated, save the cache.
      cache.save();
    }

    console.log("Updated", updated, "of", count, "projects");
  }

  if (DEBUG) console.debug({count, processed, updated});
}

for (const proj of projects.projects)
{
  if (!valid(proj))
  {
    console.warn("Invalid project", proj);
    done();
    continue;
  }

  if (proj.skip)
  {
    console.log("Skipping", proj.name);
    done();
    continue;
  }

  if (cache.current(proj))
  {
    console.log(proj.name, "is up to date");
    done();
    continue;
  }

  console.log("Updating", proj.name);

  const srcdir  = config.docDir(proj);
  const destdir = './' + path.join(docdir, proj.lang, proj.name, '/');

  // Make sure the destination path exists before we start.
  fs.mkdirSync(destdir, {recursive: true});

  const rsync = new Rsync()
    .flags('a')
    .source(srcdir)
    .destination(destdir)
    .exclude('.cache');

  rsync.execute(function(err,code,cmd)
  {
    if (err)
    { // Report the error.
      console.warn("Error copying", proj, err, {srcdir, destdir});
    }
    else
    { // Update the version.
      cache.update(proj);
      updated++;
    }

    done(cmd, code);
  });
}
