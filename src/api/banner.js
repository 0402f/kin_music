import request from '../utils/request'

/** 获取轮播图列表（公开） */
export const getBannerList = () => request.get('/banner/list')
