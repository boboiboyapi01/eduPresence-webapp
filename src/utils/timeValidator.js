export const isWithinSchedule = (schedule) => {
  const now = new Date();
  const start = new Date(now);
  const [startHour, startMinute] = schedule.startTime.split(':');
  start.setHours(startHour, startMinute, 0, 0);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + (schedule.toleranceMinutes * 2));
  return now >= start && now <= end;
};