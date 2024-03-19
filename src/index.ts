import { Hono } from 'hono'

// This ensures c.env.DB is correctly typed
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/badge.svg', async (c) => {
  try {
    const source = c.req.header('Referer')?.replace(/\/+$/, '') ?? 'default'

    c.env.DB.prepare("INSERT OR IGNORE INTO Likes (SourceName, SourceLikes) VALUES (?, 1)")
      .bind(source).run()

    const stmt = c.env.DB.prepare("SELECT SourceLikes FROM Likes WHERE SourceName = ?")
    const likes = await stmt.bind(source).first('SourceLikes')
    const text = `${likes} ${likes === 1 ? 'Like' : 'Likes'}`
    const textWidth = text.length * 8;

    // Construct the SVG string
    const svg = `
			<svg xmlns="http://www.w3.org/2000/svg" height="20" width="${textWidth}">
			  <text id="likesText" x="50%" y="50%" font-family="sans-serif" dominant-baseline="middle" text-anchor="middle">${text}</text>
			  <script type="text/ecmascript">
			    <![CDATA[
			      var textElement = document.getElementById('likesText');
			      textElement.addEventListener('mouseover', function() {
			        textElement.textContent = '👍 Like!';
			      });
			      textElement.addEventListener('mouseout', function() {
			        textElement.textContent = '${text}';
			      });
			    ]]>
			  </script>
			</svg>
		`
		c.header('Content-Type', 'image/svg+xml')
    return c.body(svg)
  } catch (e) {
    console.log(e)
    c.set('Content-Type', 'text/plain')
    return c.text(500)
  }
})

app.post('/', async (c) => {
  try {
  	const source = c.req.header('Referer')?.replace(/\/+$/, '') ?? 'default'

  	c.env.DB.prepare("INSERT OR REPLACE INTO Likes (SourceName, SourceLikes) VALUES (?, COALESCE((SELECT SourceLikes + 1 FROM Likes WHERE SourceName = ?), 1))")
		.bind(source, source).run()

    const stmt = c.env.DB.prepare("SELECT SourceLikes FROM Likes WHERE SourceName = ?")
    const likes = await stmt.bind(source).first('SourceLikes')
    return c.text(likes ?? 1)
  } catch (e) {
  	console.log(e)
    return c.text(500)
  }
})

export default app