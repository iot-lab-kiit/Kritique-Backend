export const createResponse = (
  status: number,
  message: string | null,
  data: any | null
) => {
  return { status, message, data };
};
