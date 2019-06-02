/// Shared Types

export interface IApiToken {
  accessToken: string,
  tokenType: string,
  expiresIn: number,
  createdAt: Date,
}