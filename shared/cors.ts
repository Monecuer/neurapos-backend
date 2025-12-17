
/**
 * Encore CORS middleware for all HTTP services.
 * @param {any} req
 * @param {any} ctx
 * @param {Function} next
 */

export const cors = async (...args: any[]) => {
  const next = args[args.length - 1];
  const res = await next();
  res.headers = {
    ...res.headers,
    "Access-Control-Allow-Origin": "https://neurapos.monecuer.com",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
  return res;
};
