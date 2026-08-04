# Windows

## Code signing

### Code signing with certificates

- We had problems getting certificates to be used on CI because it required that the certificate be used on attested servers. There's a fee for attestation also.
- Extended Validation certificates were very expensive.

### Code signing with [Azure Trusted Signing](https://azure.microsoft.com/en-us/products/artifact-signing)

- At the time, Azure Trusted Signing was not available for smaller German organizations. It seems to be available now.
- It is much cheaper and you're charged per code signing.
- It is offered by Microsoft.
- It is supported by Electron Builder. See [Azure Trusted Signing](https://www.electron.build/docs/features/code-signing/code-signing-win#azure-trusted-signing-type-azure--beta) in the Electron Builder documentation.
- Does not require attestation of the code signing server.
