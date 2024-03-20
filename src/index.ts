import { Hono } from 'hono'

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('*', async (c) => {
  if (new URL(c.req.url).pathname !== '/') return c.redirect('/', 307)

  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-control', 'no-cache')
  c.header('Access-Control-Allow-Origin', '*')
  if (true || c.req.header('Referer')) {
    try {
      const source = c.req.header('Referer')?.replace(/\/+$/, '') ?? 'default'

      await c.env.DB.prepare("INSERT OR IGNORE INTO Likes (SourceName, SourceLikes) VALUES (?, 1)")
        .bind(source).run()

      const stmt = c.env.DB.prepare("SELECT SourceLikes FROM Likes WHERE SourceName = ?")
      const likes = await stmt.bind(source).first('SourceLikes')
      const text = `${likes} ${likes === 1 ? 'Like' : 'Likes'}`
      const textWidth = text.length * 8;

      const svg = `
  			<svg xmlns="http://www.w3.org/2000/svg" height="24" width="${textWidth}">
          <rect width="100%" height="100%" fill="white"></rect>
  			  <text x="50%" y="50%" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">${text}</text>
  			</svg>
  		`
      return c.body(svg)
    } catch (e) {
      console.log(e)

      const text = `500 Likes`
      const textWidth = text.length * 8;
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" height="24" width="${textWidth}">
          <rect width="100%" height="100%" fill="white"></rect>
          <text x="50%" y="50%" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">${text}</text>
        </svg>
      `
      return c.body(svg)
    }
  } else {
    // no referer = browser viewing the page?
    return c.html(`
<!-- HTML generated using hilite.me --><div style="background: #f0f3f3; overflow:auto;width:auto;border:solid gray;border-width:.1em .1em .1em .8em;padding:.2em .6em;"><pre style="margin: 0; line-height: 125%"><span style="color: #330099; font-weight: bold">&lt;img</span> <span style="color: #330099">style=</span><span style="color: #CC3300">&#39;cursor: pointer;&#39;</span>
  <span style="color: #330099">src=</span><span style="color: #CC3300">&#39;${c.req.url}&#39;</span>
  <span style="color: #330099">onclick=</span><span style="color: #CC3300">&quot;fetch(&#39;${c.req.url}&#39;, {method:&#39;POST&#39;}).then(()=&gt;this.src=&#39;${c.req.url}&#39;.split(&#39;?&#39;)[0]+&#39;?t=&#39;+Date.now())&quot;</span>
  <span style="color: #330099">onmouseover=</span><span style="color: #CC3300">&quot;this.src=&#39;data:image/svg+xml;base64,CiAgCQkJPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSI1NiI+CiAgCQkJICA8dGV4dCBpZD0ibGlrZXNUZXh0IiB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPvCfkY0gTGlrZTwvdGV4dD4KICAJCQk8L3N2Zz4KICAJCQ==&#39;&quot;</span>
  <span style="color: #330099">onmouseout=</span><span style="color: #CC3300">&quot;this.src=&#39;${c.req.url}?t=0&#39;&quot;</span>
<span style="color: #330099; font-weight: bold">&gt;</span>
</pre></div>
      
        <img style='cursor: pointer;'
          src='${c.req.url}'
          onclick="fetch('${c.req.url}', {method:'POST'}).then(()=>this.src='${c.req.url}'.split('?')[0]+'?t='+Date.now())"
          onmouseover="this.src='data:image/svg+xml;base64,CiAgCQkJPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHdpZHRoPSI2NCI+CiAgICAgICAgICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ3aGl0ZSI+PC9yZWN0PgogIAkJCSAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5GNIExpa2UhPC90ZXh0PgogIAkJCTwvc3ZnPgogIAkJ'"
          onmouseout="this.src='${c.req.url}?t=0'"
        >
      `)
  }
})

app.post('*', async (c) => {
  if (new URL(c.req.url).pathname !== '/') return c.redirect('/', 307)

  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-control', 'no-cache')
  c.header('Access-Control-Allow-Origin', '*')
  try {
  	const source = c.req.header('Referer')?.replace(/\/+$/, '') ?? 'default'

  	c.env.DB.prepare("INSERT OR REPLACE INTO Likes (SourceName, SourceLikes) VALUES (?, COALESCE((SELECT SourceLikes + 1 FROM Likes WHERE SourceName = ?), 2))")
		.bind(source, source).run()

    const stmt = c.env.DB.prepare("SELECT SourceLikes FROM Likes WHERE SourceName = ?")
    const likes = await stmt.bind(source).first('SourceLikes')
    const text = `${likes} ${likes === 1 ? 'Like' : 'Likes'}`
    const textWidth = text.length * 8;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" width="${textWidth}">
        <rect width="100%" height="100%" fill="white"></rect>
        <text x="50%" y="50%" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">${text}</text>
      </svg>
    `
    return c.body(svg)
  } catch (e) {
  	console.log(e)

    const text = `500 Likes`
    const textWidth = text.length * 8;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" height="24" width="${textWidth}">
        <rect width="100%" height="100%" fill="white"></rect>
        <text x="50%" y="50%" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">${text}</text>
      </svg>
    `
    return c.body(svg)
  }
})

export default app