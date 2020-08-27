import mocha from "mocha";
import { getHookReporter } from "./utils";
export default getHookReporter(mocha.reporters.Min);
