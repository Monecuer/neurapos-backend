import { Service } from "encore.dev/service";
import { cors } from "../cors";

export default new Service("users", {
	middlewares: [cors],
});
