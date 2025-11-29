<script setup>
import { useProductStore } from '../stores/productStore'
import ProductCard from '../components/ProductCard.vue'

const productStore = useProductStore()
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-8 text-center">精選商品</h1>

    <!-- 商品網格 -->
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
      <ProductCard
        v-for="product in productStore.products"
        :key="product.id"
        :product="product"
      />
    </div>
  </div>
</template>
