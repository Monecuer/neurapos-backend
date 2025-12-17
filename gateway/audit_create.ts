import * as audit from "../audit/create";

// Proxy handler for creating an audit log
export async function createAudit(req: any, res: any) {
  const result = await audit.create(req.body, {});
  res.json(result);
}
