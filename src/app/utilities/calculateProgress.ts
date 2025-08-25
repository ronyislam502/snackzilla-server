export const calculateProgress = (current: number, prev: number) => {
  if (prev > 0) return ((current - prev) / prev) * 100;
  if (current > 0) return 100;
  return 0;
};
