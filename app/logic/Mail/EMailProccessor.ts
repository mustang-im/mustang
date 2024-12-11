// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

import type { EMail } from "./EMail";
import { ArrayColl } from "svelte-collections";
import type PostalMime from "postal-mime";
import { AbstractFunction } from "../util/util";

export class EMailProcessorList {
  static processors = new ArrayColl<EMailProcessor>();
}

export class EMailProcessor {
  runOn: ProcessingStartOn;
  process(email: EMail, mime: PostalMime) {
    throw new AbstractFunction();
  }

  static hookup() {
    if (EMailProcessorList.processors.some(p => p instanceof this)) {
      return;
    }
    EMailProcessorList.processors.add(new this());
  }
  unhookup() {
    EMailProcessorList.processors.remove(this);
  }
}

export enum ProcessingStartOn {
  Parse = 1,
  BeforeSpamFilter = 2,
  NewMessage = 3,
  AfterFilterRules = 4,
  Sent = 5,
  Manual = 6,
}
