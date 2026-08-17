import "cobe";

declare module "cobe" {
  interface COBEOptions {
    onRender?: (state: Partial<COBEOptions>) => void;
  }
}
