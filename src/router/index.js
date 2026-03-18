import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import("../views/login/LoginIndex.vue"),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import("../views/login/RegisterIndex.vue"),
    },
    {
      path: '/',
      name: 'layout',
      component: () => import("../views/layout/LayoutIndex.vue"),
      redirect: '/login',
      children :[
        {
          path: '/my',
          name: 'my',
          component: () => import("../views/my/MyIndex.vue")
        },
        {
          path: '/upload',
          name: 'upload',
          component: () => import("../views/upload/UploadIndex.vue")
        },
        {
          path: '/video',
          name: 'video',
          component: () => import("../views/video/HomeView.vue")
        }
      ]
    },
  ],
})

export default router
