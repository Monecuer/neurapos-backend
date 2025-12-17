import * as audit from "../audit/list";

// Proxy handler for listing audit logs
export async function listAuditLogs(req: any, res: any) {
  const result = await audit.list();
  res.json(result);
}
