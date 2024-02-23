import jwt from "jsonwebtoken";

const JWT_KEY =
  process.env.JWT_KEY || "e2b185bd471dda7a14cb8d9cfb8d1c568ac27926";

export type TokenData = {
  id: number;
};

export const createToken = (payload: TokenData) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, JWT_KEY, { expiresIn: "30d" }, function (err, token) {
      if (err) return reject(err);
      resolve(token as string);
    });
  });
};

export const verifyToken = (token: string) => {
  return new Promise<TokenData>((resolve, reject) => {
    jwt.verify(token, JWT_KEY, function (err, decoded) {
      if (err) return reject(err);
      resolve(decoded as TokenData);
    });
  });
};
