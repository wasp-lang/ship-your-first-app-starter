import type { ComponentType } from "react";
import { DataFlowDrawer } from "./drawers/DataFlowDrawer";
import { UpdateTaskDrawer } from "./drawers/UpdateTaskDrawer";

export interface DrawerProps {
  onDismiss: () => void;
}

export const DRAWER_REGISTRY: Record<string, ComponentType<DrawerProps>> = {
  "data-flow":   DataFlowDrawer,
  "update-task": UpdateTaskDrawer,
};
