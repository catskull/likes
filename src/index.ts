import { Hono } from 'hono'

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

const retrieveLikes = async (source, c, increment = true) => {
  const stmt = c.env.DB.prepare("SELECT SourceLikes FROM Likes WHERE SourceName = ?")

  const oldSource = c.req.header('Referer')?.replace(/\/+$/, '')
  const oldLikes = await stmt.bind(oldSource).first('SourceLikes')

  await c.env.DB.prepare("INSERT OR IGNORE INTO Likes (SourceName, SourceLikes) VALUES (?, ?)")
    .bind(source, oldLikes + 1).run()

  if (increment) {
    await c.env.DB.prepare("INSERT OR REPLACE INTO Likes (SourceName, SourceLikes) VALUES (?, COALESCE((SELECT SourceLikes + 1 FROM Likes WHERE SourceName = ?), 2))")
      .bind(source, source).run()
  }

  return await stmt.bind(source).first('SourceLikes')
}

app.get('/plain', async (c) => {
  const u = new URL(c.req.header('Referer'))
  const source = u.host + u.pathname
  const likes = await retrieveLikes(source, c, false)
  return c.text(likes)
})

app.get('*', async (c) => {
  if (new URL(c.req.url).pathname !== '/') return c.redirect('/', 307)
  if (!c.req.header('Referer')) return c.redirect('https://catskull.net/likes', 307)
  const u = new URL(c.req.header('Referer'))
  const source = u.host + u.pathname

  let likes = false

  if (u.protocol !== 'https:') {
    likes = 418 // teapot
  } else if (!source.length) {
    likes = 404 // not found
  } else {
    try {
      const stmt = c.env.DB.prepare("SELECT SourceLikes FROM Likes WHERE SourceName = ?")

      const oldSource = c.req.header('Referer')?.replace(/\/+$/, '')
      const oldLikes = await stmt.bind(oldSource).first('SourceLikes')

      await c.env.DB.prepare("INSERT OR IGNORE INTO Likes (SourceName, SourceLikes) VALUES (?, ?)")
        .bind(source, oldLikes + 1).run()

      likes = await stmt.bind(source).first('SourceLikes')
    } catch (e) {
      console.log(e)
      likes = '500'
    }
  }
  const text = `${likes} ${likes === 1 ? 'Like' : 'Likes'}`
  const textWidth = text.length * 8

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" height="24" width="${textWidth}">
      <rect width="100%" height="100%" fill="white"></rect>
      <text x="50%" y="50%" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">${text}</text>
    </svg>
  `

  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-control', 'no-cache')
  c.header('Access-Control-Allow-Origin', '*')
  return c.body(svg)
})

app.post('/plain', async (c) => {
  const u = new URL(c.req.header('Referer'))
  const source = u.host + u.pathname
  const likes = await retrieveLikes(source, c)
  return c.text(likes)
})

app.post('*', async (c) => {
  if (new URL(c.req.url).pathname !== '/') return c.redirect('/', 307)

  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-control', 'no-cache')
  c.header('Access-Control-Allow-Origin', '*')
  try {
    const u = new URL(c.req.header('Referer'))
    const source = u.host + u.pathname

  	await c.env.DB.prepare("INSERT OR REPLACE INTO Likes (SourceName, SourceLikes) VALUES (?, COALESCE((SELECT SourceLikes + 1 FROM Likes WHERE SourceName = ?), 2))")
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
