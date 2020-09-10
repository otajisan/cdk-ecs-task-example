import {config} from "dotenv";
import {resolve} from "path";

export const configEnv = (stage: string = 'local') => {
  config({path: resolve(__dirname, `.env.${stage}`)});
};