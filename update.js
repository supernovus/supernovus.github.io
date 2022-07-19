#!/usr/bin/env node

const path  = require('path');
const Rsync = require('rsync');
const uconf = require('../update.json');
const pconf = require('./src/projects.json');

for (const proj of pconf.projects)
{
  if (!('docs' in proj) || !('dir' in proj)) continue; // skip it.
  console.log("Updating", proj.name);
  const srcdir = path.join(uconf.projroot, proj.lang, proj.dir, uconf.docdir);
  const destdir = path.join('./docs', proj.docs);
  const rsync = new Rsync()
    .flags('a')
    .source(srcdir)
    .destination(destdir);

  rsync.execute(function(err,code,cmd)
  {
    if (err)
    {
      console.error("Error copying",proj,err);
    }
  });
}

console.log("Updated all projects");