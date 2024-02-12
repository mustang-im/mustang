import { Observable, notifyChangedProperty } from "../../logic/util/Observable";
import { ArrayColl } from "svelte-collections";

export class MustangApp extends Observable {
  id: string;
  /** User-visible name of the app */
  name: string;
  /** App icon, either as SVG string or as Svelte component */
  icon: string | ConstructorOfATypedSvelteComponent;
  /** Main window content that shows when the user selected this app */
  mainWindow: ConstructorOfATypedSvelteComponent;
  /** Window header content that shows when the user selected this app */
  windowHeader: ConstructorOfATypedSvelteComponent | null;
  /** Sidebar content that shows `showSidebar` is true.
   * This shows when *another* app is active.
   * This is *not* the sidebar of an app while the app itself is open. */
  sidebar: ConstructorOfATypedSvelteComponent | null;

  /** Whether `sidebar` should be open or not */
  @notifyChangedProperty
  showSidebar: boolean = false;

  /**
   * Shows as smaller apps underneath this app.
   * They are logically part of this app.
   *
   * E.g. an editor (write mail, edit calendar entry) for the app.
   * Or the most favorite third party web apps.
   *
   * Should be a very small number (0, 1 up to max 3-5),
   * due to UI space constaints.
   */
  readonly subApps = new ArrayColl<MustangApp>;
}
