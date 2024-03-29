import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/rviews/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/rviews/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/rviews/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/open',
    component: Layout,
    redirect: '/open/model',
    hidden: true,
    children: [
      {
        path: 'model',
        component: () => import('@/rviews/open/model'),
        hidden: true
      },
      {
        path: 'dcs',
        component: () => import('@/rviews/open/dcs'),
        hidden: true
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/rviews/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/rviews/error-page/401'),
    hidden: true
  },
  {
    path: '/examination/:id',
    component: () => import('@/rviews/exam/testPaper'),
    name: 'TestPaper',
    hidden: true,
    meta: { title: '参加考试', noCache: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/rviews/dashboard'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'el-icon-s-home', affix: true, noCache: false }
      }
    ]
  },
  {
    path: '/explorer',
    component: Layout,
    redirect: '/explorer/index',
    children: [
      {
        path: 'index',
        component: () => import('@/rviews/explorer/index'),
        name: 'Explorer',
        meta: { title: '文档', icon: 'el-icon-files' }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/rviews/profile/index'),
        name: 'Profile',
        meta: { title: '我的', icon: 'user', noCache: true }
      }
    ]
  },
  {
    path: '/index',
    component: () => import('@/rviews/hollysys/index'),
    meta: {
      title: 'hollysys',
      icon: 'component',
      roles: ['admin']
    },
    children: [
      {
        path: 'teacher',
        component: () => import('@/rviews/hollysys/teacher/index'),
        name: 'TeacherSide',
        meta: { title: '教练员', icon: 'user', noCache: true }
      },
      {
        path: 'student',
        component: () => import('@/rviews/hollysys/student/index'),
        name: 'stuSide',
        meta: { title: '学员', icon: 'user', noCache: true }
      }
    ]
  }, {
    path: '/hls',
    component: () => import('@/rviews/hollysys/index'),
    meta: {
      title: 'hollysys',
      icon: 'component',
      roles: ['admin']
    },
    children: [
      {
        path: 'teacher',
        component: () => import('@/rviews/hollysys/teacher/index'),
        name: 'TeacherSide',
        meta: { title: '教练员', icon: 'user', noCache: true }
      },
      {
        path: 'student',
        component: () => import('@/rviews/hollysys/student/index'),
        name: 'stuSide',
        meta: { title: '学员', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */

/* Router Modules */
import frameRouter from './rmodules/frame'
import teacherRouter from './rmodules/teacher'
import engineerRouter from './rmodules/engineer'
import adminRouter from './rmodules/admin'
import studentRouter from './rmodules/student'
import examRouter from './rmodules/exam'

const debugRouter = []
if (process.env.NODE_ENV === 'development') {
  debugRouter.push(
    {
      path: '/playgound',
      component: Layout,
      redirect: '/playgound/docview',
      hidden: false,
      meta: {
        title: 'debug',
        icon: 'component'
      },
      children: [
        {
          path: 'docview',
          component: () => import('@/rviews/playground/docview'),
          name: 'DocView',
          meta: { title: 'pdf', icon: 'user', noCache: true }
        },
        {
          path: 'video',
          component: () => import('@/rviews/playground/video'),
          name: 'Video',
          meta: { title: 'video', icon: 'user', noCache: true }
        },
        {
          path: 'icon',
          component: () => import('@/views/icons/index'),
          name: 'Icons',
          meta: { title: 'Icons', icon: 'icon', noCache: true }
        }
      ]
    }
  )
}

export const asyncRoutes = [
  // rubik router here
  adminRouter,
  examRouter,
  engineerRouter,
  teacherRouter,
  studentRouter,
  // frameRouter 以 array 方式提供
  ... frameRouter,
  // other router
  ... debugRouter,

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
