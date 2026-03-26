import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/index'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import("../views/login/LoginIndex.vue"),
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import("../views/login/RegisterIndex.vue"),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'layout',
      component: () => import("../views/layout/LayoutIndex.vue"),
      redirect: '/video',
      meta: { requiresAuth: true },
      children :[
        {
          path: '/my',
          name: 'my',
          component: () => import("../views/my/MyIndex.vue"),
          meta: { requiresAuth: true }
        },
        {
          path: '/upload',
          name: 'upload',
          component: () => import("../views/upload/UploadIndex.vue"),
          meta: { requiresAuth: true }
        },
        {
          path: '/video',
          name: 'video',
          component: () => import("../views/video/HomeView.vue"),
          meta: { requiresAuth: true }
        },
        {
          path: '/edit',
          name: 'edit',
          component: () => import("../components/EditProfile.vue"),
          meta: { requiresAuth: true }
        }
      ]
    },
  ],
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)

  if (requiresAuth && !userStore.isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    // 已登录用户访问登录/注册页，重定向到首页
    next('/video')
  } else {
    // 其他情况正常放行
    next()
  }
})

export default router
