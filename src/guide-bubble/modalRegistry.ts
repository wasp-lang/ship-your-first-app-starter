import type { ComponentType } from "react";
import { DataFlowModal } from "./modals/DataFlowModal";

export interface ModalProps {
  onDismiss: () => void;
}

export const MODAL_REGISTRY: Record<string, ComponentType<ModalProps>> = {
  "data-flow": DataFlowModal,
};
