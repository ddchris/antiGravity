<script setup>
// 不需要特別的邏輯，純靜態展示
</script>

<template>
  <div class="container mx-auto px-4 py-12 max-w-2xl">
    <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-8">聯絡我們</h1>

      <!-- 聯絡資訊 -->
      <div class="space-y-4 mb-10 text-center">
        <p class="text-gray-600">
          <span class="font-semibold text-gray-800">地址：</span>
          台北市松山區反重力路 1 號
        </p>
        <p class="text-gray-600">
          <span class="font-semibold text-gray-800">電話：</span>
          +886-2-1234-5678
        </p>
        <p class="text-gray-600">
          <span class="font-semibold text-gray-800">Email：</span>
          support@antigravity.store
        </p>
      </div>

      <!-- QR Code -->
      <div class="flex flex-col items-center mb-10">
        <p class="text-gray-600 mb-2 font-medium">掃描加入官方 Line</p>
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://antigravity.store"
          alt="QR Code"
          class="w-32 h-32 border-4 border-white shadow-lg rounded-lg"
        >
      </div>

      <!-- 模擬表單 -->
      <form class="space-y-6" @submit.prevent>
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <input
            type="text"
            id="name"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="您的姓名"
          >
        </div>

        <div>
          <label for="message" class="block text-sm font-medium text-gray-700 mb-1">訊息</label>
          <textarea
            id="message"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            placeholder="請輸入您的訊息..."
          ></textarea>
        </div>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
        >
          送出訊息
        </button>
      </form>
    </div>
  </div>
</template>
