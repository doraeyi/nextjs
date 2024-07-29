import jwt, { JwtPayload } from 'jsonwebtoken'



const DEFAULT_SIGN_OPTION = {
  expiresIn: '7d'
}

export const signJwtAccessToken = (
  payload,
  options = DEFAULT_SIGN_OPTION
) => {
  const secretKey = process.env.SECRET
  const token = jwt.sign(payload, secretKey, options)
  return token
}

export const verifyJwt = (token) => {
  // console.log("process.env.SECRET", process.env.SECRET)
  try {
    const secretKey = process.env.SECRET
    const payload = jwt.verify(token, secretKey)
    return payload
  } catch (error) {
    console.error(error)
  }
}