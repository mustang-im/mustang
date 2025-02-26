import { appGlobal } from "../../../app";

export class OWALoginBackground {
  static async submitLoginForm(username: string, password: string, partition: string, elements: OWALoginFormElements) {
    elements.username.value = username;
    elements.password.value = password;
    if ("flags" in elements.form.elements) {
      (elements.form.elements.flags as any).value |= 1;
    }
    if ("trusted" in elements.form.elements) {
      (elements.form.elements.trusted as any).checked = true;
    }
    let url = new URL(elements.form.getAttribute("action"), elements.url).toString();
    let data = Object.fromEntries(new FormData(elements.form));
    return await appGlobal.remoteApp.OWA.fetchText(partition, url, data);
  }

  static async findLoginElements(url: string, partition: string): Promise<OWALoginFormElements | null> {
    let response = await appGlobal.remoteApp.OWA.fetchText(partition, url);
    let elements: OWALoginFormElements | null = null;
    if (await response.ok) {
      let url = await response.url;
      let text = await response.text;
      let dom = new DOMParser().parseFromString(text, "text/html");
      for (let form of dom.forms) {
        if (!form.getAttribute("action")) {
          continue;
        }
        let username: HTMLInputElement | null = null;
        let password: HTMLInputElement | null = null;
        for (let e of form.elements) {
          let element = e as HTMLInputElement;
          if (element.style.display == "none") {
            continue;
          }
          if (element.type == "text" || element.type == "email") {
            if (username) {
              username = null;
              break;
            }
            username = element;
          }
          if (element.type == "password") {
            if (password) {
              password = null;
              break;
            }
            password = element;
          }
        }
        if (username && password) {
          if (elements) {
            elements = null;
            break;
          }
          elements = { url, form, username, password };
        }
      }
    }
    return elements;
  }
}

export type OWALoginFormElements = {
  url: string,
  form: HTMLFormElement,
  username: HTMLInputElement,
  password: HTMLInputElement,
}
