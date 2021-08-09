import 'core-js/stable'
import 'regenerator-runtime/runtime'

class Elements {
    constructor() {
        this.searchInput = document.querySelector('.search__input')
        this.coinsList = document.querySelector('.search__list')
    }
}

class App {
    constructor() {
        this.DOM = new Elements()
        this.coins = []
        this._getCoins()

        this.DOM.searchInput.addEventListener(
            'input',
            this._searchType.bind(this)
        )
    }
    async _getCoins() {
        const url = `https://api.coinranking.com/v2/coins/`
        const proxyUrl = 'https://thingproxy.freeboard.io/fetch/'
        const apiKey =
            'coinranking63a60ce1bc0426d018e92fbc6c02e2453ddab0e6f8df5d50'

        const res = await fetch(proxyUrl + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': `${apiKey}`,
                'Access-Control-Allow-Origin': '*',
            },
        })
        const data = await res.json()
        data.data.coins.forEach(coin => {
            const coinData = {
                uuid: coin.uuid,
                symbol: coin.symbol,
                name: coin.name,
                iconUrl: coin.iconUrl,
                color: coin.color,
                price: coin.price,

                rank: coin.rank,
                change: coin.change,
                volume24h: coin['24hVolume'],
                sparkline: coin.sparkline,
                marketCap: coin.marketCap,
                btcPrice: coin.btcPrice,
            }
            this.coins.push(coinData)
        })
        console.log(this.coins)
        // console.log(data.data.coins[0]['24hVolume'])
    }

    _searchType(e) {
        const value = e.currentTarget.value.toLowerCase()
        this.DOM.coinsList.innerHTML = ''
        if (!this.DOM.searchInput.value) return
        this.coins.forEach(coin => {
            if (coin.name.toLowerCase().includes(value)) {
                const html = `
                <li class="list__item coin">
                    <img
                        src="${coin.iconUrl}"
                        alt="${coin.name}"
                        class="coin__logo"
                    />
                    <p class="coin__name">${coin.name}</p>
                </li>
                `
                this.DOM.coinsList.insertAdjacentHTML('beforeend', html)
                console.log(coin.name)
            }
        })
    }
}

const app = new App()
