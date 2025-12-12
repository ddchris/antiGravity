export const salesMockData = {
  get months() {
    const months = []
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        months.push(monthStr)
    }
    return months
  },
  
  categories: ['electronics', 'clothing', 'home', 'beauty', 'sports'],

  // Cache for generated data
  _data: {},

  _generateData(month) {
    if (this._data[month]) return this._data[month]

    const daysCount = 30
    const data = {}
    
    this.categories.forEach(cat => {
      data[cat] = Array.from({ length: daysCount }, () => Math.floor(Math.random() * 4000) + 1000)
    })

    this._data[month] = data
    return data
  },

  getDataByMonth(month) {
    const categoryData = this._generateData(month)
    const days = Array.from({ length: 30 }, (_, i) => `${i + 1}日`)
    return { days, categoryData }
  },

  getMonthTotals(month) {
    const categoryData = this._generateData(month)
    return this.categories.map(cat => {
      const total = categoryData[cat].reduce((acc, curr) => acc + curr, 0)
      return { value: total, name: cat }
    })
  },

  getMonthCategoryTotals(month) {
    const categoryData = this._generateData(month)
    return this.categories.map(cat => {
      return categoryData[cat].reduce((acc, curr) => acc + curr, 0)
    })
  }
}
