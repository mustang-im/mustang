# Protocol

This describes the wire protocol between the 2 processes.

This can be implemented by any message passing protocol, as long as it has a message name as string, and a payload as JSON or string. This includes WebSockets, DOM events, WebRTC, and most other IPC methods. If your protocol - e.g. TCP - knows no message names, only payloads, you can use the property `method` of the payload as message name.

It can be implemented for many different languages, so it can also bridge the language barrier.

## Class description

The server sends a description of the class to the client. The client uses this to create a stub implementation, which offers a very similar interface and calls the server.

method = "class"
payload =
```
[
  {
    className: "Car",
    extends: "Movable",
    functions: [
      {
        name: "startEngine",
        params: [],
      },
    ],
    getters: [
      {
        name: "owner",
        hasSetter: true,
      },
    ]
    properties: [
      {
        name: "brand",
      },
    ]
  }
]
```

Notes:
* `extends` is optional and allows class inheritance
* `properties` are direct object properties without getter/setter. They MUST be sent with the object description.

## Object description

The server returns an object instance.

```
{
  className: "Car",
  id: "1234",
  properties: [
    {
      name: "brand",
    },
  ]
}
```

Notes:
* `properties` are included only if the class description has `properties`.
* The server MUST send the class description before using the corresponding `className`.

## Object reference

Pass a reference to a remote object to the remote end:

```
{
  idRemote: "1234",
}
```

Pass a reference to a local object to the remote end:

```
{
  idLocal: "1234",
}
```

Note:
* This MUST have been preceeded by an object description with this ID.
* "Remote" and "local" are from the perspective of the sending party. That means, when receiving, "remote" means local and "local" means remote.

## Value

Where a value is allowed, it may be either:
* Simple JS value like a string, a number or a boolean
* JSON array
* JSON object with properties, each having a value
* Object description, as defined above
* Object reference, as defined above

## Function calls

For a function `startEngine(3, "Wilma")`:

method = `func`
payload =
```
{
  name: "startEngine",
  args: [
    3,
    "Wilma"
  ],
  namedArgs: {
    driver: "Wilma"
  },
  obj: "2345"
}
```

Notes:
* `namedArgs` are not yet supported.

Response:

method = `func-r`
payload = value (see above)

## Getters

For a getter `owner`:

method = `get`
payload =
```
{
  name: "owner",
  obj: "2345"
}
```

Response:

method = `get-r`
payload = value (see above)

## Setters

For a setter `owner`:

method = `set`
payload =
```
{
  name: "owner",
  value: "Wilma" (value),
  obj: "2345"
}
```

Response:

method = `set-r`

## new

To construct a new remote object, optionally with constructor parameters:

method = `new`
payload =
```
{
  className: "Car",
  args: [
    "Wilma" (value)
  ]
}
```

Response:

method = `new-r`
payload = object description (see above)

## delete

When your local stub for a remote object is no longer needed and garbage collected, you must tell the remote side, so that the other side can also garbage collect the object. Otherwise, you leak everything.

method = `del`
payload =
```
{
  idRemote: "1234"
}
```

Notes:
* There is no response.
* You MUST call this, once you dropped all local references to this object.
* After calling this, you MUST NOT use this ID anymore.


# TODO

* Compare [RFC 8927](https://www.rfc-editor.org/rfc/rfc8927.html)
