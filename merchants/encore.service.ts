import { Service } from "encore.dev/service";
import { cors } from "../shared/cors";

export default new Service("merchants", {
	middlewares: [cors],
});
