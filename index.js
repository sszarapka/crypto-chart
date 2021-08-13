import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'

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
        this.timePeriod = document.querySelector('.chart__period')
        this.timePeriodButtons = document.querySelectorAll('.period__button')
        this.period24h = document.querySelector('.period24')
        this.chart = document.getElementById('chart')
        this.chartLoader = document.querySelector('.chart__loading')
    }
}

class App {
    #coins = []
    constructor() {
        this.DOM = new Elements()

        this._getCoins()
        this.priceChart
        this.currentCoin
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
        window.addEventListener('resize', this._setChartAspectRatio.bind(this))
        this.DOM.timePeriod.addEventListener(
            'click',
            this._changeTimePeriod.bind(this)
        )
    }

    async _getData(url, apiKey) {
        const proxyUrl = 'https://thingproxy.freeboard.io/fetch/'

        const res = await fetch(proxyUrl + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': `${apiKey}`,
                'Access-Control-Allow-Origin': '*',
            },
        })

        return await res.json()
    }

    async _getCoins() {
        const data = await this._getData(
            `https://api.coinranking.com/v2/coins/`,
            'coinranking63a60ce1bc0426d018e92fbc6c02e2453ddab0e6f8df5d50'
        )
        data.data.coins.forEach(coin => {
            const coinData = {
                uuid: coin.uuid,
                symbol: coin.symbol,
                name: coin.name,
                iconUrl: coin.iconUrl,
                color:
                    coin.color == '#000000' || !coin.color
                        ? '#ffffff'
                        : coin.color,
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

    async _getCoinData(e) {
        const id = e.target.dataset.id
        const coin = this.#coins.find(coin => coin.uuid == id)
        this.DOM.searchInput.value = ''

        const data = await this._getPeriodData('24h', coin.uuid)
        let xLabels = data.xLabels
        const sparkline = data.sparkline

        this._displayData(coin, sparkline, this._24hours(xLabels))
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

    _displayData(coin, sparkline, xLabels) {
        this.currentCoin = coin
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

        if (coin.change > 0) {
            this.DOM.coinArrow.classList = 'fas fa-arrow-up'
        }
        if (coin.change < 0) {
            this.DOM.coinArrow.classList = 'fas fa-arrow-down'
        }
        document
            .querySelector('.period__button--active')
            .classList.remove('period__button--active')
        this.DOM.period24h.classList.add('period__button--active')
        this._displayChart(sparkline, coin.color, xLabels, '24h')
    }

    _closeSearchListEvent(e) {
        if (e.target.classList.contains('search__input')) return
        this.DOM.coinsList.style.display = 'none'
    }
    _closeSearchList() {
        this.DOM.coinsList.style.display = 'none'
    }

    _displayChart(sparkline, color = '#ffffff', xLabels, period) {
        //stop loding
        this.DOM.chart.style.filter = 'blur(0px)'
        this.DOM.chartLoader.style.display = 'none'

        const chart = this.DOM.chart.getContext('2d')
        if (this.priceChart) this.priceChart.destroy()

        const newSparkline = sparkline.map(data => parseFloat(data))

        Chart.defaults.plugins.legend = false

        this.priceChart = new Chart(chart, {
            type: 'line',
            data: {
                labels: xLabels,
                datasets: [
                    {
                        label: false,
                        data: newSparkline,
                        fill: false,
                        borderColor: color,
                        tension: 0,
                        pointBackgroundColor: 'transparent',
                        pointBorderWidth: '0',
                        borderJoinStyle: 'round',
                    },
                ],
            },
            options: {
                scales: {
                    x: {
                        ticks: {
                            autoSkip: true,
                            maxTicksLimit: this._determineTicksLimit(period),
                            maxRotation: 0,
                        },
                    },
                },
            },
        })
        this.priceChart.options.scales.x.ticks.maxTicksLimit = 7
        this.priceChart.options.scales['y'].ticks.color = '#aaa'
        this.priceChart.options.scales['x'].ticks.color = '#aaa'
        //this.priceChart.options.xAxes.ticks.maxTicksLimit = 10

        this._setChartAspectRatio()
    }

    _determineTicksLimit(period) {
        if (period == '24h') return 12
        if (period == '7d') return 7
        if (period == '30d') return 10
        if (period == '1y') return 12
        if (period == '5y') return 5
    }

    _setChartAspectRatio() {
        if (!this.priceChart) return
        if (screen.orientation.type == 'portrait-primary')
            this.priceChart.options.aspectRatio = 1.3
        else this.priceChart.options.aspectRatio = 2
    }

    async _changeTimePeriod(e) {
        //start loading
        this.DOM.chart.style.filter = 'blur(30px)'
        this.DOM.chartLoader.style.display = 'flex'

        const button = e.target
        document
            .querySelector('.period__button--active')
            .classList.remove('period__button--active')
        button.classList.add('period__button--active')

        const period = e.target.dataset.period

        const data = await this._getPeriodData(period, this.currentCoin.uuid)
        console.log(data)

        let xLabels = data.xLabels
        const sparkline = data.sparkline

        if (period == '24h') xLabels = this._24hours(xLabels)

        if (period == '7d') xLabels = this._7days(xLabels)

        if (period == '30d') xLabels = this._30days(xLabels)

        if (period == '1y') xLabels = this._1year(xLabels)

        if (period == '5y') xLabels = this._5years(xLabels)

        this._displayChart(sparkline, this.currentCoin.color, xLabels, period)
    }

    async _getPeriodData(period, uuid) {
        const res = await this._getData(
            `https://api.coinranking.com/v2/coin/${uuid}/history?timePeriod=${period}`,
            'coinranking63a60ce1bc0426d018e92fbc6c02e2453ddab0e6f8df5d50'
        )
        const data = res.data.history

        let sparkline = []
        let xLabels = []

        data.forEach(item => {
            let date = new Date(0)
            date.setUTCSeconds(item.timestamp)

            sparkline.push(item.price)
            xLabels.push(date)
        })

        return {
            sparkline,
            xLabels,
        }
    }

    _24hours(xLabels) {
        return xLabels.map(
            label => label.getHours().toString().padStart(2, '0') + ':00'
        )
    }

    _7days(xLabels) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return xLabels.map(label => days[label.getDay()])
    }

    _30days(xLabels) {
        // prettier-ignore
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',   'Oct', 'Nov', 'Dec']

        return xLabels.map(
            label => label.getDate() + ' ' + months[label.getMonth()]
        )
    }

    _1year(xLabels) {
        // prettier-ignore
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep','Oct',  'Nov', 'Dec']

        return xLabels.map(label => months[label.getMonth()])
    }

    _5years(xLabels) {
        return xLabels.map(label => label.getFullYear())
    }
}

const app = new App()
