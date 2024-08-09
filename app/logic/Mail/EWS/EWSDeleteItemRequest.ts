export default class EWSDeleteItemRequest {
  m$DeleteItem: any = {
    m$ItemIds: {
      t$ItemId: {}
    },
    DeleteType: "MoveToDeletedItems",
  };

  constructor(id: string, attributes?: {[key: string]: string | boolean}) {
    this.m$DeleteItem.m$ItemIds.t$ItemId.Id = id;
    Object.assign(this.m$DeleteItem, attributes);
  }
}
