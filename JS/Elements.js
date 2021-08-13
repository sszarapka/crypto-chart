export class Elements {
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
