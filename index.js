import 'core-js/stable'
import 'regenerator-runtime/runtime'

class Elements {
    constructor() {
        this.searchInput = document.querySelector('.search__input')
        this.coinsList = document.querySelector('.search__list')
        this.coinName = document.querySelector('.data__name')
        this.coinLogo = document.querySelector('.name__logo')
        this.coinPrice = document.querySelector('.price__value')
        this.coinArrow = document
            .querySelector('.data__price')
            .querySelector('i')
        this.priceChange = document.querySelector('.price-change')
        this.volume24h = document.querySelector('.volume-24h')
        this.marketCap = document.querySelector('.market-cap')
        this.btcPrice = document.querySelector('.btc-price')
        this.rank = document.querySelector('.rank')
        this.main = document.querySelector('.main')
        this.data = document.querySelector('.data')
    }
}

class App {
    #coins = []
    constructor() {
        this.DOM = new Elements()

        this._getCoins()

        this.DOM.searchInput.addEventListener(
            'input',
            this._searchType.bind(this)
        )
        this.DOM.coinsList.addEventListener(
            'click',
            this._getCoinData.bind(this)
        )
        document.addEventListener(
            'click',
            this._closeSearchListEvent.bind(this)
        )
        this.DOM.searchInput.addEventListener(
            'focus',
            () => (this.DOM.coinsList.style.display = 'block')
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
                price: parseFloat(coin.price).toFixed(6),

                rank: coin.rank,
                change: parseFloat(coin.change).toFixed(6),
                volume24h: parseFloat(coin['24hVolume']).toFixed(2),
                sparkline: coin.sparkline,
                marketCap: parseInt(coin.marketCap),
                btcPrice: parseFloat(coin.btcPrice).toFixed(6),
            }
            this.#coins.push(coinData)
        })
    }

    _getCoinData(e) {
        const id = e.target.dataset.id
        const coin = this.#coins.find(coin => coin.uuid == id)
        this.DOM.searchInput.value = ''
        this._displayData(coin)
        this.DOM.coinsList.innerHTML = ''
        this._closeSearchList()
    }
    _getRelevancy(coinName, value) {
        const name = coinName.toLowerCase()
        const inputValue = value.toLowerCase()
        if (name === inputValue) return 0
        else if (name.startsWith(inputValue)) return 1
        else return 2
    }
    _searchType(e) {
        this.DOM.coinsList.style.display = 'block'
        const value = e.currentTarget.value.toLowerCase()

        let coinsToDisplay = []
        this.DOM.coinsList.innerHTML = ''
        if (!this.DOM.searchInput.value) return
        this.#coins.forEach(coin => {
            const name = coin.name.toLowerCase()
            if (name.includes(value)) {
                coinsToDisplay.push(coin)
            }
        })
        coinsToDisplay.sort(
            (coinA, coinB) =>
                this._getRelevancy(coinA.name, value) -
                this._getRelevancy(coinB.name, value)
        )

        this._displayCoinsInSearchList(coinsToDisplay)
    }

    _displayCoinsInSearchList(coins) {
        coins.forEach(coin => {
            const html = `
                <li class="list__item coin" data-id="${coin.uuid}">
                    <img
                        src="${coin.iconUrl}"
                        alt="${coin.name}"
                        class="coin__logo"
                        data-id="${coin.uuid}"
                    />
                    <p class="coin__name" data-id="${coin.uuid}">${coin.name}</p>
                </li>
                `
            this.DOM.coinsList.insertAdjacentHTML('beforeend', html)
        })
    }

    _displayData(coin) {
        this.DOM.coinName.innerHTML = `
        <img
            src="${coin.iconUrl}"
            alt=""
            class="name__logo"
        />${coin.name}
        `
        this.DOM.coinPrice.textContent =
            '$' + coin.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        this.DOM.priceChange.textContent =
            '$' + coin.change.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        this.DOM.volume24h.textContent =
            '$' +
            coin.volume24h.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        this.DOM.marketCap.textContent =
            '$' +
            coin.marketCap.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        this.DOM.btcPrice.innerHTML =
            '<i class="fab fa-bitcoin"></i> ' +
            coin.btcPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        this.DOM.rank.textContent = '#' + coin.rank

        this.DOM.main.style.background = `radial-gradient(
            farthest-side at -20% 120%,
            ${coin.color} -200%,
            #0e0e0f 100%
        )`

        this.DOM.data.style.background = `radial-gradient(
            farthest-side at -20% 120%,
            ${coin.color} -200%,
            #0e0e0f 100%
        )`

        document.documentElement.style.setProperty('--coin-color', coin.color)
        console.log(coin.color)

        if (coin.change > 0) {
            this.DOM.coinArrow.classList = 'fas fa-arrow-up'
        }
        if (coin.change < 0) {
            this.DOM.coinArrow.classList = 'fas fa-arrow-down'
        }
    }

    _closeSearchListEvent(e) {
        if (e.target.classList.contains('search__input')) return
        this.DOM.coinsList.style.display = 'none'
    }
    _closeSearchList() {
        this.DOM.coinsList.style.display = 'none'
    }
}

const app = new App()
