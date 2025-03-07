export enum AlarmType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
}

export interface AlarmDto {
  id: number;
  alarmType: AlarmType;
  fromUserName: string;
  targetUserName: string;
  text: string;
  registeredAt: string;
}
