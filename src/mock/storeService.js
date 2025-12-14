
// Mock API to simulate fetching stores
import storesData from './stores.json'

export const fetchStores = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(storesData)
    }, 300)
  })
}

export const getCities = (locale = 'zh-TW') => {
  const isEn = locale === 'en'
  const key = isEn ? 'City_En' : 'City'
  const cities = [...new Set(storesData.map(store => store[key]))]
  return cities
}

export const getDistricts = (city, locale = 'zh-TW') => {
  const isEn = locale === 'en'
  const cityKey = isEn ? 'City_En' : 'City'
  const districtKey = isEn ? 'District_En' : 'District'
  
  const districts = [...new Set(storesData
    .filter(store => store[cityKey] === city)
    .map(store => store[districtKey])
  )]
  return districts
}
