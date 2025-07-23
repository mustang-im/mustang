import { MustangApp } from "../AppsBar/MustangApp";
import VisualApp from "./VisualApp.svelte";
import VisualIcon from "lucide-svelte/icons/waypoints"; //or chart-network
import { gt } from "../../l10n/l10n";

export class VisualMustangApp extends MustangApp {
  id = "visual";
  name = gt`Visual`;
  icon = VisualIcon;
  mainWindow = VisualApp;
}

export const visualMustangApp = new VisualMustangApp();
