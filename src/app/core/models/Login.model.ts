export interface ILoginResponse {
  "Login": {
    "AccessToken": string,
    "ExpiresIn": number,
    "RefreshExpiresIn": number,
    "RefreshToken": string,
    "TokenType": string,
    "NotBeforePolicy": number,
    "SessionState": string,
    "Scope": string
  }
}

export interface ILoginRequest {
  "username": string,
  "password": string,
}