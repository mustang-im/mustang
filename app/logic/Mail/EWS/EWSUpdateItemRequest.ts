// SPDX-FileCopyrightText: 2024 Mustang GmbH <contact@mustang.im>>
//
// SPDX-License-Identifier: EUPL-1.2

export default class EWSUpdateItemRequest {
  m$UpdateItem: any = {
    m$ItemChanges: {
      t$ItemChange: {
        t$ItemId: {},
        t$Updates: {
          t$SetItemField: [],
          t$DeleteItemField: [],
        },
      },
    },
    ConflictResolution: "AlwaysOverwrite",
  };

  constructor(id: string, attributes?: {[key: string]: string | boolean}) {
    this.itemChange.t$ItemId.Id = id;
    Object.assign(this.m$UpdateItem, attributes);
  }

  protected get itemChange() {
    return this.m$UpdateItem.m$ItemChanges.t$ItemChange;
  }

  addField(type: string, key: string, value: any, FieldURI: string, FieldIndex?: string) {
    let field = {} as any;
    if (FieldIndex) {
      field.t$IndexedFieldURI = { FieldURI, FieldIndex };
    } else {
      field.t$FieldURI = { FieldURI };
    }
    if (value == null) {
      this.itemChange.t$Updates.t$DeleteItemField.push(field);
    } else {
      field["t$" + type] = { ["t$" + key]: value };
      this.itemChange.t$Updates.t$SetItemField.push(field);
    }
  }
}
