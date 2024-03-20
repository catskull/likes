# 👍 Likes
A decentralized social network in a single HTML tag

More info: https://likes.catskull.net

## Development
 - Clone the repo
 - `npm install`
 - `npx wrangler d1 create likes-dev`
 - Copy the output to `wrangler.toml`:
```
[[d1_databases]]
binding = "DB" # available in your Worker on env.DB
database_name = "likes-dev"
database_id = "<unique-ID-for-your-database>"
```
 - `npx wrangler dev`
 - `npx wrangler d1 execute likes-dev --local --file=./schema.sql`

[Cloudflare D1 docs](https://developers.cloudflare.com/d1/)

## Contributing
The most helpful contribution is to use Likes and spread the word!

Feel free to open a pull request for code cleanup. If you have a big idea, open an issue with some thoughts before sending a big PR.

Feature requests will be given thoughtful consideration.

All contributors are welcome, even if it's your first time! That said, I may not have time to give each contribution a full response but I'll do my best.
