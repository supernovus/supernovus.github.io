(function()
{
  "use strict";

  const list = document.querySelector("#projects > tbody");
  const tmpl = document.querySelector("#project");

  // A really cheap path.join() emulator.
  function join(...paths)
  {
    return paths.join('/').replace(/\/+/g, '/');
  }

  function renderProject(proj, data)
  {
    const item = tmpl.content.cloneNode(true);
    const lang = item.querySelector('.lang > code');
    lang.textContent = proj.lang;
    lang.classList.add(proj.lang);
    item.querySelector('.name').textContent = proj.name;
    item.querySelector('.ver').textContent = proj.ver;
    item.querySelector('.desc').textContent = proj.desc ?? '';
    const srcLink = item.querySelector('.src a');
    const docsLink = item.querySelector('.docs a');
    if ('src' in proj)
    {
      srcLink.setAttribute('href', data.srcurl+proj.src);
    }
    else
    {
      srcLink.classList.add('none');
    }
    if (!proj.skip)
    {
      const docurl = join(data.docurl, proj.lang, proj.name);
      docsLink.setAttribute('href', docurl);
    }
    else
    {
      docsLink.classList.add('none');
    }
    list.appendChild(item);
  }

  function renderProjects(data)
  {
    if (data.title)
    {
      document.querySelector('head > title').textContent = data.title;
      document.querySelector('body > h1').textContent = data.title;
    }
    if (data.updated)
    {
      document.querySelector('#updated').textContent = data.updated;
    }
    if (Array.isArray(data.projects))
    {
      for (const proj of data.projects)
      {
        renderProject(proj, data);
      }
    }
  }

  fetch('src/projects.json')
    .then(resp => resp.json())
    .then(renderProjects);

  // If we reached here without errors, the browser supports modern JS.
  document.querySelector('#old-javascript').style.display = 'none';

})();