/*
Can be look like user model but user at client side should not have the password all the time.

So, for that we create a separate model.
 */

export interface AuthData
{
  email : string,
  password : string
}
