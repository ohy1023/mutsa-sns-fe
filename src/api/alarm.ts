import privateApi from '@/utils/privateApi';
import { Response, Page } from '@/types/common';
import { AlarmDto } from '@/types/alarm';

// 알림 목록 조회
export const getAlarms = async (page: number = 0): Promise<Page<AlarmDto>> => {
  const response = await privateApi.get<Response<Page<AlarmDto>>>(
    '/users/alarm',
    {
      params: { page, size: 20, sort: 'registeredAt,DESC' },
    },
  );
  return response.data.result;
};
