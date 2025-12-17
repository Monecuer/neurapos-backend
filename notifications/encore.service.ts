import { Service } from "encore.dev/service";
import { cors } from "../cors";

export default new Service("notifications", {
	middlewares: [cors],
});
