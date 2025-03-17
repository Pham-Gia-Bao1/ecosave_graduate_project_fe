declare module "quagga" {
  // Define the QuaggaJSResultObject type
  interface QuaggaJSResultObject {
      codeResult: {
          code: string;
          format: string;
          start: number;
          end: number;
          decodedCodes: any[];
      };
      line: { x: number; y: number }[];
      angle: number;
      pattern: number[];
      box: number[][];
      boxes: number[][][];
  }

  // Define the main Quagga object
  interface Quagga {
      init(config: any, callback: (err?: Error) => void): void;
      start(): void;
      stop(): void;
      onDetected(callback: (result: QuaggaJSResultObject) => void): void;
      offDetected(callback: (result: QuaggaJSResultObject) => void): void;
      decodeSingle(config: any, callback: (result: QuaggaJSResultObject) => void): void;
      // Add other methods as needed
  }

  const Quagga: Quagga;
  export default Quagga;
  export { QuaggaJSResultObject };
}