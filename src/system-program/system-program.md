# System Program

The Arch System Program is Arch's core program. This program contains a set of variants that can be thought-of as native functionality that can be used within any Arch program.

The System Program creates new accounts, assigns accounts to owning programs, marks accounts as executable, and writes data to the accounts.

In order to make calls to the System Program, the following mapping can help you point to the correct functionality.

| index | method          |
|-------|-----------------|
| 0     | CreateAccount   |
| 1     | WriteBytes      |
| 2     | MakeExecutable  |
| 3     | AssignOwnership |
