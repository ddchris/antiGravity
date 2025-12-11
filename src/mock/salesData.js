const categories = ['Electronics', 'Clothing', 'Home', 'Books']

// 產生過去 6 個月 (含當月) 的 YYYY-MM 格式
function getLast6Months() {
  const result = []
  const today = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    result.push(`${year}-${month}`)
  }
  return result
}

const months = getLast6Months()

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateMonthData(month) {
  const daysInMonth = new Date(month.split('-')[0], month.split('-')[1], 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}日`)
  
  const categoryData = {}
  categories.forEach(cat => {
    categoryData[cat] = Array.from({ length: daysInMonth }, () => getRandomInt(10, 200))
  })

  return {
    days,
    categoryData
  }
}

const dataStore = {}
months.forEach(month => {
  dataStore[month] = generateMonthData(month)
})

export const salesMockData = {
  months,
  categories,
  getDataByMonth(month) {
    return dataStore[month]
  },
  // 取得該月各分類總銷售額 (圓餅圖用)
  getMonthTotals(month) {
    const { categoryData } = dataStore[month]
    return categories.map(cat => ({
      name: cat,
      value: categoryData[cat].reduce((a, b) => a + b, 0)
    }))
  },
  // 取得該月總銷售額 (長條圖比較用)
  getMonthCategoryTotals(month) {
     const { categoryData } = dataStore[month]
     return categories.map(cat => categoryData[cat].reduce((a, b) => a + b, 0))
  }
}
