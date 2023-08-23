import { PoseidonContext } from "../poseidon/PoseidonContext";

interface Scene {
  setup(): void;
  update(context: PoseidonContext): void;
  teardown(): void;
}

export {Scene};
