export type TSMLPerson = {
  name: string;
  email: string;
}

export type TSMLThing = {
  "@type": string;
  name: string;
  description: string;
}

export type TSMLChooseAction = {
  /** The question to answer with this choice */
  description: string;
  actionOption: TSMLThing[];
  /** The one choosing, i.e. our user */
  agent: TSMLPerson;
  /** Current selection from our user */
  object: TSMLThing;
};
