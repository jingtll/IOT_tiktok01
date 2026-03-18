<template>
  <div class="tab-bar">
    <div
      v-for="(tab, index) in tabs"
      :key="index"
      :class="{ 'tab-item': true, 'active': activeTab === index }"
      @click="selectTab(index)"
    >
      {{ tab.title }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'TabBar',
  props: {
    tabs: {
      type: Array,
      required: true
    },
    modelValue: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      activeTab: this.modelValue
    }
  },
  methods: {
    selectTab(index) {
      this.activeTab = index;
      this.$emit('update:modelValue', index);
      this.$emit('tab-change', index);
    }
  },
  watch: {
    modelValue(newVal) {
      this.activeTab = newVal;
    }
  }
}
</script>

<style scoped>
.tab-bar {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  padding: 0;
  margin: 0;
}

.tab-item {
  padding: 12px 24px;
  cursor: pointer;
  border: none;
  background: none;
  font-size: 16px;
  color: #6c757d;
  transition: all 0.3s ease;
  position: relative;
}

.tab-item:hover {
  background-color: #e9ecef;
  color: #495057;
}

.tab-item.active {
  color: #007bff;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #007bff;
}
</style>