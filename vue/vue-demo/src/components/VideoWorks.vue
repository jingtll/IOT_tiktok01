<template>
  <div class="video-works">
    <!-- 标签栏 -->
    <TabBar :tabs="tabList" v-model="activeTabIndex" @tab-change="handleTabChange" />

    <!-- 视频网格 -->
    <VideoGrid :videos="currentVideos" />
  </div>
</template>

<script>
import TabBar from './TabBar.vue'
import VideoGrid from './VideoGrid.vue'

export default {
  name: 'VideoWorks',
  components: {
    TabBar,
    VideoGrid
  },
  data() {
    return {
      activeTabIndex: 0,
      // 模拟数据
      tabList: [
        { title: '全部', key: 'all' },
        { title: '教程', key: 'tutorial' },
        { title: '演示', key: 'demo' },
        { title: '案例', key: 'case' }
      ],
      videoData: {
        all: [
          {
            id: 1,
            title: 'Vue.js 入门教程',
            description: '学习 Vue.js 基础概念和组件开发',
            thumbnail: 'https://via.placeholder.com/300x200?text=Vue+教程',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '15:30',
            views: 1234
          },
          {
            id: 2,
            title: 'React vs Vue 对比分析',
            description: '深入分析两个主流前端框架的差异',
            thumbnail: 'https://via.placeholder.com/300x200?text=框架对比',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '22:45',
            views: 2567
          },
          {
            id: 3,
            title: 'JavaScript ES6 新特性',
            description: '掌握现代 JavaScript 的核心语法',
            thumbnail: 'https://via.placeholder.com/300x200?text=ES6',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '18:20',
            views: 3456
          }
        ],
        tutorial: [
          {
            id: 4,
            title: 'CSS Grid 布局完全指南',
            description: '学会使用 CSS Grid 创建复杂的网页布局',
            thumbnail: 'https://via.placeholder.com/300x200?text=CSS+Grid',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '25:10',
            views: 1890
          },
          {
            id: 5,
            title: 'TypeScript 进阶技巧',
            description: '深入理解 TypeScript 的高级特性',
            thumbnail: 'https://via.placeholder.com/300x200?text=TypeScript',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '30:15',
            views: 2100
          }
        ],
        demo: [
          {
            id: 6,
            title: '响应式网站展示案例',
            description: '展示如何创建现代化的响应式网站',
            thumbnail: 'https://via.placeholder.com/300x200?text=响应式网站',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '12:30',
            views: 987
          }
        ],
        case: [
          {
            id: 7,
            title: '电商网站完整项目',
            description: '从零开始构建一个完整的电商网站',
            thumbnail: 'https://via.placeholder.com/300x200?text=电商项目',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '45:20',
            views: 5432
          },
          {
            id: 8,
            title: '企业管理系统案例',
            description: '企业级管理系统开发实战',
            thumbnail: 'https://via.placeholder.com/300x200?text=管理系统',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: '38:45',
            views: 3210
          }
        ]
      }
    }
  },
  computed: {
    currentVideos() {
      const currentKey = this.tabList[this.activeTabIndex]?.key;
      return this.videoData[currentKey] || [];
    }
  },
  methods: {
    handleTabChange(index) {
      console.log('切换到标签:', index, '-', this.tabList[index].title);
    }
  }
}
</script>

<style scoped>
.video-works {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .video-works {
    padding: 10px;
  }
}
</style>