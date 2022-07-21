// Sanity check.
if (typeof require === 'undefined')
{
  throw new Error("Cannot use this outside of Node");
}

// The version of our cache file format.
const V = 1;

// We need `fs` to write the cache file.
const fs = require('fs');

// We use UTF-8 encoding.
const ENC = 'utf8';

function projId(proj)
{
  return proj.lang + ':' + proj.name;
}

/**
 * A small private cache class used by the `update.js` script.
 *
 * Currently has only limited capabilities.
 */
class Cache
{
  /**
   * Build a cache instance.
   *
   * @param {string} filename - The path to the cache file.
   *
   * The cache file will be stored as compact (unformatted) JSON.
   * If it does not exist, it will be created.
   * This catches any thrown errors and simply outputs them to the
   * console without interrupting the calling process.
   */
  constructor(filename)
  {
    this.filename = filename;

    if (fs.existsSync(filename))
    { // Try loading the existing cache file.
      try 
      { // We're intentionally not using require() for this.
        const json = fs.readFileSync(filename, ENC);
        const data = JSON.parse(json);
        if (typeof data === 'object' && data !== null)
        { // Valid cache data was found.
          if (!data.V)
          { // No version property.
            data.V = V;
          }
          if (!data.P)
          { // No package information structure.
            data.P = {};
          }
          this.$cache = data;
        }
      }
      catch (e)
      { // An error was thrown, but we'll keep going.
        console.warn(e);
      }
    }

    if (this.$cache === undefined)
    { // No cache was loaded, create one.
      this.$cache = {V,P:{}};
    }

  }

  /**
   * See if a project is up to date based on its version.
   */
  current(proj)
  {
    const id = projId(proj);
    if (id in this.$cache.P)
    { // Package info was found.
      if (this.$cache.P[id].v === proj.ver)
      { // The cache version is the same as the project version.
        return true;
      }
    }
    return false;
  }

  /**
   * Update the cache with the current project info.
   */
  update(proj)
  {
    const id = projId(proj);
    if (!(id in this.$cache.P))
    { // Create a new project entry.
      this.$cache.P[id] = {};
    }
    // Set the current version.
    this.$cache.P[id].v = proj.ver;
  }

  /**
   * Save any changes into the cache file.
   *
   * This does NOT catch any thrown errors, so if one is thrown,
   * it will stop the process if not otherwise caught.
   */
  save()
  {
    const json = JSON.stringify(this.$cache);
    fs.writeFileSync(this.filename, json, ENC);
  }

  static get(filename)
  {
    return new Cache(filename);
  }

}

module.exports = Cache;
