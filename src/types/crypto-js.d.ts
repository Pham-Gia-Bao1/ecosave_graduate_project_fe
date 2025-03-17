declare module "crypto-js/md5" {
    import { WordArray } from "crypto-js";
    export default function md5(message: string | WordArray): WordArray;
  }
