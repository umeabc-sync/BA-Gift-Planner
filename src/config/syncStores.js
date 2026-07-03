import { useStudentStore } from '@/store/student'
import { useGiftStore } from '@/store/gift'
import { useGiftPlannerStore } from '@/store/giftPlanner'
import { useSettingStore } from '@/store/setting'

export function getSyncStores() {
  return {
    student: useStudentStore(),
    gift: useGiftStore(),
    giftPlanner: useGiftPlannerStore(),
    setting: useSettingStore(),
  }
}
