export const getPagination = (page?: string | number, limit?: string | number) => {
  const p = Math.max(1, parseInt(String(page || 1)));
  const l = Math.min(100, Math.max(1, parseInt(String(limit || 20))));
  const skip = (p - 1) * l;
  return { page: p, limit: l, skip, take: l };
};
