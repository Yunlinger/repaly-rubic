/** When your routing table is too long, you can split it into small modules**/

import Layout from '@/layout'

const router = {
  path: '/exam',
  component: Layout,
  name: 'Exam',
  hidden: true,
  meta: {
    title: '理论考试',
    icon: 'component',
    roles: ['admin']
  },
  children: [
    {
      path: 'questions',
      component: () => import('@/rviews/exam/question'),
      name: 'QuestionManage',
      meta: { title: '题库管理', icon: 'el-icon-right', roles: ['admin'] }
    },
    {
      path: 'papers',
      component: () => import('@/rviews/exam/paper'),
      name: 'PaperManage',
      meta: { title: '试卷列表', icon: 'el-icon-right', roles: ['admin'] }
    },
    {
      path: 'paper/:id',
      component: () => import('@/rviews/exam/paperPreview'),
      name: 'PaperPreview',
      hidden: true,
      meta: { title: '试卷预览', icon: 'el-icon-right', noCache: false, roles: ['admin'] }
    },
    {
      path: 'exam',
      component: () => import('@/rviews/exam/exam'),
      name: 'ExamManage',
      meta: { title: '考试列表', icon: 'el-icon-right', roles: ['admin'] }
    },
    {
      path: 'activities',
      component: () => import('@/rviews/exam/activities'),
      name: 'Activities',
      meta: { title: '参加考试', icon: 'el-icon-right', roles: ['student'] }
    },
    {
      path: 'judgelist/:id',
      component: () => import('@/rviews/exam/judgeList'),
      name: 'JudgeList',
      hidden: true,
      meta: { hidden: true, title: '判卷列表', icon: 'el-icon-right', roles: ['admin'] }
    },
    {
      path: 'scorelist/:id',
      component: () => import('@/rviews/exam/scoreList'),
      name: 'ScoreList',
      hidden: false,
      meta: { title: '查询考试成绩', icon: 'el-icon-right', roles: ['admin'] }
    },
    {
      path: 'mark/:id',
      component: () => import('@/rviews/exam/examDetailMark'),
      name: 'ExamDetailMark',
      hidden: true,
      meta: { title: '阅卷', icon: 'el-icon-right', roles: ['admin'] }
    },
    {
      path: 'view/:id',
      component: () => import('@/rviews/exam/examDetailView'),
      name: 'ExamDetailView',
      hidden: true,
      meta: { title: '考试详情', icon: 'el-icon-right' }
    },
    {
      path: 'my',
      component: () => import('@/rviews/exam/myScoreList'),
      name: 'MyScoreList',
      hidden: false,
      meta: { title: '我的成绩', icon: 'el-icon-right' }
    }
  ]
}

export default router
