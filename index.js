import 'core-js/stable'
import 'regenerator-runtime/runtime'
import Chart from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import { Elements } from './JS/Elements.js'

window.mobileCheck = function () {
    let check = false
    ;(function (a) {
        if (
            /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
                a
            ) ||
            /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
                a.substr(0, 4)
            )
        )
            check = true
    })(navigator.userAgent || navigator.vendor || window.opera)
    return check
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
        // const proxyUrl = 'https://thingproxy.freeboard.io/fetch/'
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/'

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

        if (screen.orientation.type == 'portrait-primary') {
            this.priceChart.options.aspectRatio = 1.3
        } else {
            Chart.defaults.elements.line.borderWidth = 3
            Chart.defaults.font.size = 14
            this.priceChart.options.aspectRatio = 2
        }
        if (window.mobileCheck()) {
            console.log('ok')

            Chart.defaults.elements.line.borderWidth = 1
            Chart.defaults.font.size = 7
        }
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
