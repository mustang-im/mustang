export interface TSMLPerson {
  name: string;
  email: string;
}

export interface TSMLThing {
  "@type": string;
  name: string;
  description: string;
}

export interface TSMLAction extends TSMLThing {
  /** The question to answer with this choice */
  description: string;
  actionOption: TSMLThing[];
  actionStatus: TSMLActionStatus;
  /** The one choosing, i.e. our user */
  agent: TSMLPerson;
  /** Current selection from our user */
  object: TSMLThing | TSMLThing[];
};

export enum TSMLActionStatus {
  InProgress = "ActiveActionStatus",
  Completed = "CompletedActionStatus",
  Failed = "FailedActionStatus",
  TODO = "PotentialActionStatus",
}

export interface TSMLChooseAction extends TSMLAction { };
