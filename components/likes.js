class Likes extends HTMLElement {
	render() {
		this.innerHTML = `
			<a><span>${this.likes} Like${this.likes === 1 ? '' : 's'}</span></a>
		`
	}

	click() {
		if (this.clicks < 10) {
			this.clicks += 1
			this.fetchLikes()
		} else {
			this.innerText = `+${this.clicks} Likes!`
			clearTimeout(this.timeout)
			this.timeout = setTimeout(() => this.render(), 500)
		}
	}

	fetchLikes() {
		this.likes += 1
		this.render()
		if (this.initialized) {
			this.innerText = `+${this.clicks} Likes!`
			clearTimeout(this.timeout)
			this.timeout = setTimeout(() => this.render(), 500)
		}
		const method = this.initialized ? 'POST' : 'GET'
		fetch(`${this.host}/plain`,
			{method: method, referrerPolicy:'no-referrer-when-downgrade'}
		).then(async r => {
			const likes = Number(await r.text())
			if (this.likes !== likes) {
				this.likes = likes
			}
		});
	}

	async connectedCallback() {
		this.timeout = undefined // reference to last timeout
		this.likes = 0
		this.clicks = 0
		this.host = this.getAttribute('host') || 'https://likes.catskull.net'
		this.onclick = this.click
		this.onmouseenter = () => { this.innerText = '👍 Like?'}
		this.onmouseleave = () => { this.render() }
		this.initialized = false
		this.fetchLikes()

		const style = document.createElement('style')
		style.innerHTML = `
			page-likes {
				cursor: pointer;
			  -webkit-user-select: none;
			  user-select: none;
			}
		`
		
		document.body.appendChild(style)
		this.initialized = true
	}
}

customElements.define('page-likes', Likes);
