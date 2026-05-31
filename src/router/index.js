import { createRouter, createWebHistory } from 'vue-router'
import RecommendView from '../views/RecommendView.vue'
import SelectedView from '../views/SelectedView.vue'
import LikeView from '../views/LikeView.vue'
import CollectView from '../views/CollectView.vue'
import FollowView from '../views/DynamicView.vue'
import LyricsView from '../views/LyricsView.vue'
import ProfileView from '../views/ProfileView.vue'
import CommentView from '../views/CommentView.vue'
// 添加关注列表页面导入
import FollowListView from '../views/FollowListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/recommend',
    },
    {
      path: '/recommend',
      name: 'recommend',
      component: RecommendView,
    },
    {
      path: '/selected',
      name: 'selected',
      component: SelectedView,
    },
    {
      path: '/like',
      name: 'like',
      component: LikeView,
    },
    {
      path: '/collect',
      name: 'collect',
      component: CollectView,
    },
    {
      path: '/follow',
      name: 'follow',
      component: FollowView,
    },
    // 添加关注列表路由
    {
      path: '/follow-list',
      name: 'followList',
      component: FollowListView,
    },
    {
      path: '/lyrics/:id',
      name: 'lyrics',
      component: LyricsView,
      props: true,
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
    },
    {
      path: '/playlist/:id',
      name: 'Playlist',
      component: () => import('../views/PlaylistView.vue'),
    },
    {
      path: '/playlist/:id/edit',
      name: 'PlaylistEdit',
      component: () => import('../views/PlaylistEditView.vue'),
    },
    {
      path: '/comment',
      name: 'Comment',
      component: CommentView,
    },
    {
      path: '/ai-track',
      name: 'AITrack',
      component: () => import('../views/AITrackView.vue'),
    },
    {
      path: '/upload',
      name: 'Upload',
      component: () => import('../views/UploadView.vue'),
    },
    {
      path: '/playlist-square',
      name: 'PlaylistSquare',
      component: () => import('../views/PlaylistSquareView.vue'),
    },
    {
      path: '/Dynamic',
      name: 'Dynamic',
      component: () => import('../views/DynamicView.vue'),
    },
    {
      path: '/message/:userId',
      name: 'Message',
      component: () => import('@/views/MessageView.vue'),
      meta: { requiresAuth: true }
    }
  ],
})

export default router
