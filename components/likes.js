class Likes extends HTMLElement {
	render() {
		this.innerHTML = `
			<a><span>${this.likes} Like${this.likes === 1 ? '' : 's'}</span></a>
		`
	}

	fetchLikes() {
		this.likes += 1
		this.render()
		if (this.initialized) {
			this.innerText = "Liked!"
			setTimeout(() => this.render(), 500)
		}
		const method = this.initialized ? 'POST' : 'GET'
		fetch(`${this.host}/plain`,
			{method: method, referrerPolicy:'no-referrer-when-downgrade'}
		).then(async r => {
			const likes = Number(await r.text())
			if (this.likes !== likes) {
				this.likes = likes
				this.render()
			}
		});
	}

	async connectedCallback() {
		this.likes = 0
		this.host = this.getAttribute('host') || 'https://likes.catskull.net'
		this.onclick = this.fetchLikes
		this.onmouseenter = () => { this.innerText = '👍 Like?'}
		this.onmouseleave = () => { this.render() }
		this.initialized = false
		this.fetchLikes()

		const style = document.createElement('style')
		style.innerHTML = `
			page-likes a {
				cursor: pointer;
			}
		`
		
		document.body.appendChild(style)
		this.initialized = true
	}
}

customElements.define('page-likes', Likes);
