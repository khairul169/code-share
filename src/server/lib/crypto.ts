import bcrypt from "bcrypt";

export const hashPassword = (password: string) => {
  return bcrypt.hash(password, 10);
};

export const verifyPassword = async (hash: string, password: string) => {
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    return false;
  }
};
