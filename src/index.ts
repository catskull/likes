import { Hono } from 'hono'

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('*', async (c) => {
  if (new URL(c.req.url).pathname !== '/') return c.redirect('/', 307)
  if (!c.req.header('Referer')) return c.redirect('https://catskull.net/likes', 307)

  c.header('Content-Type', 'image/svg+xml')
  c.header('Cache-control', 'no-cache')
  c.header('Access-Control-Allow-Origin', '*')
  try {
    console.log(c.req.header('Referer'))
    const source = c.req.header('Referer')?.replace(/\/+$/, '') ?? 'default'
    console.log(source)

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