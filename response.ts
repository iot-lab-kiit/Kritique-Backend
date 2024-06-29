export const createResponse = (
  status: { CODE: number; MESSAGE: string },
  data: any | null
) => {
  return { status: status.CODE, message: status.MESSAGE, data };
};
